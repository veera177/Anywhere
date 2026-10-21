package com.app.start_app.ai;

import com.app.start_app.food.*;
import com.app.start_app.grocery.*;
import com.app.start_app.medicine.*;
import com.app.start_app.cart.*;
import com.app.start_app.order.*;
import com.app.start_app.user.*;
import com.app.start_app.delivery.DeliveryFeeBreakdown;
import com.app.start_app.delivery.DeliveryFeeCalculator;
import com.app.start_app.platform.PlatformSettingDAO;
import com.app.start_app.rag.KnowledgeRetrievalService;
import com.app.start_app.rag.KnowledgeRetrievalService.RetrievedChunk;
import com.app.start_app.rag.KnowledgeRetrievalService.ChromaUnavailableException;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AIService {

    private final JdbcTemplate jdbcTemplate;
    private final FoodProductDAO foodProductDAO;
    private final RestaurantDAO restaurantDAO;
    private final GroceryProductDAO groceryProductDAO;
    private final GroceryStoreDAO groceryStoreDAO;
    private final MedicineProductDAO medicineProductDAO;
    private final PharmacyDAO pharmacyDAO;
    private final CartDAO cartDAO;
    private final OrderDAO orderDAO;
    private final UserDAO userDAO;
    private final AddressDAO addressDAO;
    private final GeminiClientService geminiClient;
    private final OllamaClientService ollamaClient;
    private final DeliveryFeeCalculator deliveryFeeCalculator;
    private final PlatformSettingDAO platformSettings;
    private final KnowledgeRetrievalService knowledgeRetrievalService;
    private final ObjectMapper objectMapper;
    private final String aiProvider;

    private static final String ANYWHERE_SYSTEM_PROMPT = """
            You are Anywhere's AI Assistant, a helpful digital assistant for a district-based hyperlocal delivery platform in Tamil Nadu, India.

            ABOUT ANYWHERE:
            - We connect customers with verified local businesses across districts - no warehouses, no inventory.
            - We offer 4 services: Food Delivery, Grocery Delivery, Medicine Delivery, and Courier Service.
            - Partner availability and inventory vary by district; use live database results when answering specific questions.
            - Courier uses dynamic, on-demand delivery partners (no fixed shop).

            DELIVERY RADIUS AND FEES:
            - These values are configured by the platform and may change. Never guess a radius, fee, threshold, or offer.
            - If a live setting is not included in your context, direct the customer to the checkout estimate or say you cannot verify it.

            YOUR JOB:
            - For general questions about Anywhere (what we do, how delivery works, fees, policies), answer directly using this information.
            - For SPECIFIC questions (restaurant lists, order status, real-time stock, prices), you will be given real data separately - use ONLY that provided data, never invent restaurant names, prices, or order details.
            - If you don't have enough information to answer, say so honestly instead of guessing.
            - Keep replies friendly, clear, and concise.
            """;

    // Supported districts are read from the database (the `districts` table) so the
    // assistant always knows about newly added districts and never hardcodes a list.
    private volatile Set<String> supportedDistrictsCache = null;

    private Set<String> supportedDistricts() {
        Set<String> cached = supportedDistrictsCache;
        if (cached != null) return cached;
        Set<String> names = new java.util.LinkedHashSet<>();
        try {
            names.addAll(jdbcTemplate.queryForList("SELECT LOWER(name) FROM districts", String.class));
        } catch (Exception ignored) {
            // Fall through; a partial list is still better than failing the chat.
        }
        names.add("trichy");
        names.add("tiruchirappalli");
        supportedDistrictsCache = names;
        return names;
    }

    public AIService(JdbcTemplate jdbcTemplate, FoodProductDAO foodProductDAO, RestaurantDAO restaurantDAO,
                     GroceryProductDAO groceryProductDAO, GroceryStoreDAO groceryStoreDAO,
                     MedicineProductDAO medicineProductDAO, PharmacyDAO pharmacyDAO,
                     CartDAO cartDAO, OrderDAO orderDAO, UserDAO userDAO, AddressDAO addressDAO,
                     GeminiClientService geminiClient, DeliveryFeeCalculator deliveryFeeCalculator,
                     PlatformSettingDAO platformSettings, OllamaClientService ollamaClient,
                     KnowledgeRetrievalService knowledgeRetrievalService,
                     @Value("${ai.provider:ollama}") String aiProvider) {
        this.jdbcTemplate = jdbcTemplate;
        this.foodProductDAO = foodProductDAO;
        this.restaurantDAO = restaurantDAO;
        this.groceryProductDAO = groceryProductDAO;
        this.groceryStoreDAO = groceryStoreDAO;
        this.medicineProductDAO = medicineProductDAO;
        this.pharmacyDAO = pharmacyDAO;
        this.cartDAO = cartDAO;
        this.orderDAO = orderDAO;
        this.userDAO = userDAO;
        this.addressDAO = addressDAO;
        this.geminiClient = geminiClient;
        this.ollamaClient = ollamaClient;
        this.deliveryFeeCalculator = deliveryFeeCalculator;
        this.platformSettings = platformSettings;
        this.knowledgeRetrievalService = knowledgeRetrievalService;
        this.objectMapper = new ObjectMapper();
        this.aiProvider = aiProvider == null ? "ollama" : aiProvider.trim().toLowerCase();
    }

    public AIResponse processMessage(AIRequest request) {
        String originalMessage = request.getMessage() == null ? "" : request.getMessage().trim();
        String msg = originalMessage.toLowerCase();
        Integer userId = request.getUserId();
        String district = request.getDistrict();

        // Resolve district from user profile if not provided
        if ((district == null || district.isEmpty()) && userId != null) {
            User user = userDAO.getUserById(userId);
            if (user != null && user.getDistrict() != null) {
                district = user.getDistrict();
            }
        }
        if (district == null) district = "";
        district = resolveDistrictFromMessage(msg, district.toLowerCase());

        // ── 1. FAST REGEX ACTIONS ───────────────────────────────────────────────

        // CLEAR CART
        if (msg.matches(".*\\b(clear|empty)\\b.*\\bcart\\b.*")) {
            if (userId == null) return new AIResponse("Please sign in first to clear your cart.", "NAVIGATE_SIGNIN", null);
            cartDAO.clearCart(userId);
            return new AIResponse("✅ Your shopping cart has been cleared successfully!", "NAVIGATE_CART", null);
        }

        // VIEW CART
        if (msg.matches(".*\\b(show|view|open|what is in|whats in)\\b.*\\bcart\\b.*") || msg.equals("cart")) {
            if (userId == null) return new AIResponse("Please sign in to view your cart.", "NAVIGATE_SIGNIN", null);
            return handleShowCart(userId);
        }

        // TRACK ORDER
        if (msg.matches(".*\\b(track|where is|status of)\\b.*\\border\\b.*") || msg.contains("track my order")) {
            if (userId == null) return new AIResponse("Please sign in first to track your orders.", "NAVIGATE_SIGNIN", null);
            return handleTrackOrder(userId);
        }

        // ORDER HISTORY
        if (msg.matches(".*\\b(order history|my orders|previous orders|past orders|show orders)\\b.*")) {
            if (userId == null) return new AIResponse("Please sign in to view your order history.", "NAVIGATE_SIGNIN", null);
            return new AIResponse("📦 Here is your order history.", "NAVIGATE_ORDERS", null);
        }

        // PROFILE / ADDRESSES
        if (msg.matches(".*\\b(my profile|show profile|user profile|saved address|saved addresses|my addresses)\\b.*")) {
            if (userId == null) return new AIResponse("Please sign in to see your profile details.", "NAVIGATE_SIGNIN", null);
            if (msg.contains("address")) {
                List<Address> addresses = addressDAO.getAddressesByUserId(userId);
                if (addresses.isEmpty()) {
                    return new AIResponse("You have no saved addresses. Add one in your Profile section.", "NAVIGATE_PROFILE", null);
                }
                String addressList = addresses.stream()
                        .map(a -> "• **" + a.getTitle() + "**: " + a.getAddress() + ", " + a.getCity() + " (" + a.getPincode() + ")")
                        .collect(Collectors.joining("\n"));
                return new AIResponse("📍 Your saved addresses:\n\n" + addressList, "NAVIGATE_PROFILE", null);
            }
            return new AIResponse("Opening your profile dashboard.", "NAVIGATE_PROFILE", null);
        }

        // HELP — what the assistant can do across ALL services
        if (msg.equals("help") || msg.contains("what can you do") || msg.contains("how can you help")
                || msg.contains("what can you help") || msg.contains("options") || msg.contains("services available")) {
            return new AIResponse(
                "👋 I'm the Anywhere AI Assistant. I can help you across every service:\n\n" +
                "• 🍔 Find restaurants, food & dishes\n" +
                "• 🛒 Find grocery items & stores\n" +
                "• 💊 Find medicines & nearby pharmacies\n" +
                "• 📦 Book a courier & check courier rates\n" +
                "• 🔄 Repeat your last order\n" +
                "• 📍 Track your orders\n" +
                "• 🛍️ View, add to, or clear your cart\n" +
                "• 📍 Manage your saved addresses\n\n" +
                "Just tell me what you need — for example: \"add 2 kg tomatoes to cart\" or \"book a courier in madurai\".",
                null, null);
        }

        // REPEAT LAST ORDER
        if (msg.contains("repeat order") || msg.contains("repeat last order") || msg.contains("order again")
                || msg.contains("reorder") || msg.contains("same order")
                || msg.contains("order the same") || msg.matches(".*\\b(repeat|again)\\b.*\\border\\b.*")) {
            return handleRepeatOrder(userId);
        }

        // ADD TO CART REGEX
        Pattern addPattern = Pattern.compile("add\\s+(.+?)\\s+to\\s+(my\\s+)?cart");
        Matcher addMatcher = addPattern.matcher(msg);
        if (addMatcher.find()) {
            if (userId == null) return new AIResponse("Please sign in first to add items to your cart.", "NAVIGATE_SIGNIN", null);
            String itemQuery = addMatcher.group(1).trim();
            return handleAddToCart(userId, district, itemQuery, 1);
        }

        // FAQ & POLICY QUESTIONS (Real RAG path)
        if (isFaqOrPolicyQuestion(msg)) {
            return handleFaqQuestion(originalMessage);
        }

        // OUT-OF-SCOPE TOPICS — answer honestly instead of dumping a product list.
        if (hasAnyWord(msg, OUT_OF_SCOPE_TERMS)) {
            return new AIResponse(outOfScopeReply(msg));
        }

        // NEARBY PHARMACY
        if (msg.contains("pharmacy") || msg.contains("medical shop") || msg.contains("nearby pharmacy")) {
            return handleMedicineQuery(district, "pharmacy", -1.0, msg);
        }

        // COURIER KEYWORDS
        if (msg.contains("courier") || msg.contains("parcel") || msg.contains("shipment") || msg.contains("shipping")
                || msg.contains("send package") || msg.contains("send parcel") || msg.contains("send a parcel")) {
            return handleCourierQuery(district);
        }

        // COUNT QUERIES — fast path before keyword routers
        if (msg.matches(".*\\bhow many\\b.*\\b(restaurant|restaurants)\\b.*") || msg.matches(".*\\bcount\\b.*\\b(restaurant|restaurants)\\b.*")) {
            return handleCountQuery(district, "restaurant");
        }
        if (msg.matches(".*\\bhow many\\b.*\\b(grocery store|grocery stores|grocery)\\b.*") || msg.matches(".*\\bcount\\b.*\\b(grocery store|grocery stores|grocery)\\b.*")) {
            return handleCountQuery(district, "grocery");
        }
        if (msg.matches(".*\\bhow many\\b.*\\b(pharmacy|pharmacies)\\b.*") || msg.matches(".*\\bcount\\b.*\\b(pharmacy|pharmacies)\\b.*")) {
            return handleCountQuery(district, "pharmacy");
        }
        if (msg.matches(".*\\bhow many\\b.*\\bdistrict\\b.*") || msg.matches(".*\\bcount\\b.*\\bdistrict\\b.*") || msg.matches(".*\\bhow many districts\\b.*")) {
            return handleCountDistricts();
        }

        // GROCERY KEYWORDS — before FOOD so "vegetables" isn't swallowed by the food "veg" match
        if (hasAnyWord(msg, GROCERY_TERMS)) {
            return handleGroceryQuery(district, extractSearchTerm(msg), -1.0, msg);
        }

        // MEDICINE KEYWORDS
        if (hasAnyWord(msg, MEDICINE_TERMS)) {
            return handleMedicineQuery(district, extractSearchTerm(msg), -1.0, msg);
        }

        // FOOD KEYWORDS
        if (hasAnyWord(msg, FOOD_TERMS)) {
            if (hasAnyWord(msg, "restaurant", "hotel", "best", "top")) {
                return handleRestaurantQuery(district, msg);
            }
            return handleFoodQuery(district, extractSearchTerm(msg), -1.0, msg);
        }

        // ── 1b. LOCAL INTENT CLASSIFIER (works fully offline, no Gemini) ──────
        // Broadens coverage for natural phrasings like "I want to buy rice",
        // "need paracetamol", "get some groceries" that the strict keywords miss.
        AIResponse local = handleLocalIntent(msg, district);
        if (local != null) {
            return local;
        }

        // ── 2. GEMINI INTENT DETECTION ────────────────────────────────────────
        // Route the message through the shared intent pipeline, then phrase the
        // result with Gemini. Falls back to a generic reply when offline.
        try {
            AIResponse routed = routeIntent(msg, userId, district, originalMessage);
            if (routed != null) {
                return routed;
            }
        } catch (IllegalStateException exception) {
            return new AIResponse(exception.getMessage());
        }

        if ("ollama".equals(aiProvider)) {
            return new AIResponse(unknownIntentFallback());
        }

        // ── 3. GEMINI AI FOR EVERYTHING ELSE ──────────────────────────────────
        String geminiReply = geminiClient.generateText(buildSystemContext(userId, district), originalMessage, 300);
        if (geminiReply != null && !geminiReply.isEmpty()) {
            return new AIResponse(geminiReply);
        }

        // ── 4. HARDCODED FALLBACK ─────────────────────────────────────────────
        return new AIResponse(
            "👋 Hello! I'm the Anywhere AI Assistant.\n\n" +
            "I can help you with:\n" +
            "• 🍔 Search restaurants & food\n" +
            "• 🛒 Browse grocery stores\n" +
            "• 💊 Find medicines & pharmacies\n" +
            "• 📦 Track & manage orders\n" +
            "• 🛍️ View & clear your cart\n\n" +
            "How can I help you today?"
        );
    }

    // ── CONTEXT BUILDER FOR GEMINI ─────────────────────────────────────────────
    private String buildSystemContext(Integer userId, String district) {
        StringBuilder ctx = new StringBuilder();
        ctx.append("You are the Anywhere AI Assistant — a smart, friendly delivery app assistant. ");
        ctx.append("Anywhere is a multi-service delivery platform in Tamil Nadu, India that provides: ");
        ctx.append("Food Delivery from local restaurants, Grocery Delivery from local stores, ");
        ctx.append("Medicine Delivery from pharmacies, and Courier/Parcel services. ");
        ctx.append("The platform does NOT provide agriculture services or home services (plumber, electrician, cleaning). ");
        ctx.append("Always answer concisely in 2-4 sentences. Use emojis naturally. ");
        ctx.append("User's current district: ").append(capitalize(district)).append(". ");

        if (userId != null) {
            try {
                User user = userDAO.getUserById(userId);
                if (user != null) {
                    ctx.append("User name: ").append(user.getFullName()).append(". ");
                }
                List<Order> orders = orderDAO.findByUserId(userId);
                if (!orders.isEmpty()) {
                    Order last = orders.get(0);
                    ctx.append("Last order #").append(last.getId())
                       .append(" status: ").append(formatStatus(last.getStatus())).append(". ");
                }
                List<CartItem> cartItems = cartDAO.getCartByUser(userId);
                ctx.append("Cart has ").append(cartItems.size()).append(" items. ");
            } catch (Exception e) {
                // ignore context errors
            }
        }
        return ctx.toString();
    }

    // ── HANDLERS ──────────────────────────────────────────────────────────────

    private AIResponse handleShowCart(int userId) {
        List<CartItem> cartItems = cartDAO.getCartByUser(userId);
        if (cartItems.isEmpty()) {
            return new AIResponse("🛒 Your cart is empty. Browse food, groceries, or medicines to add items!", "NAVIGATE_CART", null);
        }
        double total = cartItems.stream().mapToDouble(item -> item.getPrice() * item.getQuantity()).sum();
        String summary = cartItems.stream()
                .map(item -> "• " + item.getProductName() + " ×" + item.getQuantity() + " — ₹" + String.format("%.0f", item.getPrice() * item.getQuantity()))
                .collect(Collectors.joining("\n"));
        return new AIResponse("🛒 Your cart:\n\n" + summary + "\n\n**Total: ₹" + String.format("%.2f", total) + "**", "NAVIGATE_CART", null);
    }

    private AIResponse handleTrackOrder(int userId) {
        List<Order> orders = orderDAO.findByUserId(userId);
        if (orders.isEmpty()) {
            return new AIResponse("You haven't placed any orders yet. Start shopping!", "NAVIGATE_ORDERS", null);
        }
        Order lastOrder = orders.get(0);
        OrderTrackingResponse tracking = orderDAO.findTrackingById(lastOrder.getId());
        String status = tracking != null ? tracking.getTrackingStatus() : lastOrder.getStatus();
        return new AIResponse(
            "📦 Order #" + lastOrder.getId() + " — **" + formatStatus(status) + "**\n" +
            "Estimated delivery: " + (lastOrder.getEstimatedDeliveryTime() != null ?
                lastOrder.getEstimatedDeliveryTime().toString().replace("T", " at ") : "~45 minutes"),
            "NAVIGATE_TRACK_ORDER", lastOrder.getId());
    }

    private AIResponse handleAddToCart(int userId, String district, String itemQuery, int quantity) {
        ParsedCartItem parsed = parseCartItem(itemQuery, quantity);
        String q = parsed.query.toLowerCase().trim();
        int qty = parsed.quantity;
        String original = itemQuery;

        // Food products
        List<FoodProduct> foods = foodProductDAO.getFoodProducts(district);
        for (FoodProduct f : foods) {
            if (f.getName().toLowerCase().contains(q) || q.contains(f.getName().toLowerCase())) {
                addToCartDb(userId, "FOOD", f.getId(), qty, f.getName(), f.getPrice(), f.getImageUrl(), f.getRestaurantName());
                return new AIResponse("✅ Added **" + qty + "× " + f.getName() + "** (from " + f.getRestaurantName() + ") to your cart!", "NAVIGATE_CART", null);
            }
        }

        // Grocery products
        List<GroceryProduct> groceries = groceryProductDAO.getGroceryProducts(district, null);
        for (GroceryProduct g : groceries) {
            if (g.getName().toLowerCase().contains(q) || q.contains(g.getName().toLowerCase())) {
                addToCartDb(userId, "GROCERY", g.getId(), qty, g.getName(), g.getPrice(), g.getImageUrl(), g.getStoreName());
                return new AIResponse("✅ Added **" + qty + "× " + g.getName() + "** (from " + g.getStoreName() + ") to your cart!", "NAVIGATE_CART", null);
            }
        }

        // Medicine products
        List<MedicineProduct> medicines = medicineProductDAO.getMedicineProducts(district, null);
        for (MedicineProduct m : medicines) {
            if (m.getName().toLowerCase().contains(q) || q.contains(m.getName().toLowerCase())) {
                addToCartDb(userId, "MEDICINE", m.getId(), qty, m.getName(), m.getPrice(), m.getImageUrl(), m.getPharmacyName());
                return new AIResponse("✅ Added **" + qty + "× " + m.getName() + "** to your cart!", "NAVIGATE_CART", null);
            }
        }

        AIResponse elsewhere = findItemElsewhere(q);
        if (elsewhere != null) {
            return elsewhere;
        }

        return new AIResponse("❌ Sorry, I couldn't find \"" + original + "\" in " + capitalize(district) + ". Try browsing our food, grocery, or medicine sections.", "NAVIGATE_FOOD", null);
    }

    // ── CROSS-DISTRICT HINT ───────────────────────────────────────────────────
    // When nothing matches in the user's district, tell them where it IS available
    // (no auto-add: delivery is district-scoped).
    private AIResponse findItemElsewhere(String query) {
        String q = query == null ? "" : query.toLowerCase().trim();
        if (q.isEmpty()) return null;
        for (FoodProduct f : foodProductDAO.getFoodProducts(null)) {
            if (matches(f.getName(), q)) {
                return new AIResponse("🍔 **" + f.getName() + "** isn't available in your district right now, but it is in **"
                        + capitalize(f.getDistrict()) + "**. Switch to that district to order it from " + f.getRestaurantName() + ".",
                        "NAVIGATE_FOOD", null);
            }
        }
        for (GroceryProduct g : groceryProductDAO.getGroceryProducts(null, null)) {
            if (matches(g.getName(), q)) {
                return new AIResponse("🛒 **" + g.getName() + "** isn't available in your district right now, but it is in **"
                        + capitalize(g.getDistrict()) + "**. Switch to that district to order it from " + g.getStoreName() + ".",
                        "NAVIGATE_GROCERY", null);
            }
        }
        for (MedicineProduct m : medicineProductDAO.getMedicineProducts(null, null)) {
            if (matches(m.getName(), q)) {
                return new AIResponse("💊 **" + m.getName() + "** isn't available in your district right now, but it is in **"
                        + capitalize(m.getDistrict()) + "**. Switch to that district to order it.",
                        "NAVIGATE_MEDICINE", null);
            }
        }
        return null;
    }

    private boolean matches(String name, String query) {
        if (name == null) return false;
        String n = name.toLowerCase();
        return n.contains(query) || query.contains(n);
    }

    // ── CART ITEM PARSING ("2 kg tomatoes" → {quantity:2, query:"tomatoes"}) ──
    private ParsedCartItem parseCartItem(String itemQuery, int defaultQty) {
        if (itemQuery == null) return new ParsedCartItem(1, "");
        String trimmed = itemQuery.trim();
        Matcher unitMatcher = Pattern.compile(
            "^([0-9]+(?:\\.[0-9]+)?)\\s*(kg|kgs|kilogram|kilograms|g|gram|grams|ml|milliliter|milliliters|l|litre|litres|ltr|ltrs|liter|liters|pcs|pieces|pack|packs|packet|packets|bottle|bottles|units?)\\s+(.+)$",
            Pattern.CASE_INSENSITIVE).matcher(trimmed);
        if (unitMatcher.matches()) {
            double amount = Double.parseDouble(unitMatcher.group(1));
            int qty = (int) Math.max(1, Math.round(amount));
            return new ParsedCartItem(qty, unitMatcher.group(3).trim());
        }
        Matcher amountMatcher = Pattern.compile(
            "^([0-9]+)\\s+(.+)$",
            Pattern.CASE_INSENSITIVE).matcher(trimmed);
        if (amountMatcher.matches()) {
            int qty = Integer.parseInt(amountMatcher.group(1));
            if (qty >= 1 && qty <= 50) {
                return new ParsedCartItem(qty, amountMatcher.group(2).trim());
            }
        }
        if (trimmed.matches("(?i)^(a|an|some|one)\\s+.+$")) {
            return new ParsedCartItem(1, trimmed.replaceFirst("(?i)^(a|an|some|one)\\s+", "").trim());
        }
        return new ParsedCartItem(defaultQty, trimmed);
    }

    private static class ParsedCartItem {
        final int quantity;
        final String query;
        ParsedCartItem(int quantity, String query) {
            this.quantity = quantity;
            this.query = query;
        }
    }

    private AIResponse handleFoodQuery(String district, String query, double priceLimit, String fullMsg) {
        List<FoodProduct> products = foodProductDAO.getFoodProducts(district);
        boolean isVeg = fullMsg.contains("veg") && !fullMsg.contains("non-veg") && !fullMsg.contains("non veg");
        boolean isNonVeg = fullMsg.contains("non-veg") || fullMsg.contains("non veg");
        boolean cheap = fullMsg.contains("cheap") || fullMsg.contains("affordable") || fullMsg.contains("under") || priceLimit > 0;

        List<FoodProduct> filtered = products.stream()
                .filter(p -> {
                    if (query != null && !query.isEmpty() && !p.getName().toLowerCase().contains(query.toLowerCase())) return false;
                    if (isVeg && !"VEG".equalsIgnoreCase(p.getFoodType())) return false;
                    if (isNonVeg && !"NON-VEG".equalsIgnoreCase(p.getFoodType())) return false;
                    if (priceLimit > 0 && p.getPrice() > priceLimit) return false;
                    return true;
                }).collect(Collectors.toList());

        if (cheap) filtered.sort(Comparator.comparingDouble(FoodProduct::getPrice));

        if (filtered.isEmpty()) {
            if (query != null && !query.isEmpty() && !products.isEmpty()) {
                String list = products.stream().limit(5)
                        .map(p -> "• **" + p.getName() + "** — ₹" + p.getPrice() + " [" + (p.getFoodType() != null ? p.getFoodType() : "Food") + "] @ " + p.getRestaurantName())
                        .collect(Collectors.joining("\n"));
                return new AIResponse("🍔 I couldn't find \"" + query + "\" but here's what's available in " + capitalize(district) + ":\n\n" + list, "NAVIGATE_FOOD", null);
            }
            return new AIResponse("🍔 No food items found with those filters in " + capitalize(district) + ". Try browsing our Food section!", "NAVIGATE_FOOD", null);
        }

        String itemWord = (query != null && !query.isBlank()) ? query : "these dishes";
        String firstMatch = filtered.get(0).getName();
        String list = filtered.stream().limit(5)
                .map(p -> "• **" + p.getName() + "** — ₹" + p.getPrice() + " [" + (p.getFoodType() != null ? p.getFoodType() : "Food") + "] @ " + p.getRestaurantName())
                .collect(Collectors.joining("\n"));
        return new AIResponse("Yes! " + capitalize(itemWord) + " is available in " + capitalize(district)
                + " — I found " + filtered.size() + " matching " + (filtered.size() == 1 ? "dish" : "dishes")
                + ", including **" + firstMatch + "**.\n\n" + list
                + "\n\nAsk me to add any of these to your cart.", "NAVIGATE_FOOD", null);
    }

    private AIResponse handleRestaurantQuery(String district, String fullMsg) {
        List<Restaurant> restaurants = restaurantDAO.getRestaurants(district);
        if (restaurants.isEmpty()) {
            return new AIResponse(
                "I could not find active restaurants in " + capitalize(district) + " right now. Open Food Delivery to check available kitchens.",
                "NAVIGATE_FOOD",
                null
            );
        }

        String list = restaurants.stream()
                .sorted(Comparator.comparingDouble(Restaurant::getRating).reversed())
                .limit(3)
                .map(r -> "- **" + r.getName() + "**, " + r.getLocation() + " | Rating " + String.format("%.1f", r.getRating()))
                .collect(Collectors.joining("\n"));

        String heading = (fullMsg.contains("best") || fullMsg.contains("top"))
                ? "Best restaurants in " + capitalize(district) + " based on ratings:\n\n"
                : "Restaurants available in " + capitalize(district) + ":\n\n";

        return new AIResponse(heading + list + "\n\nOpen Food Delivery to view menus.", "NAVIGATE_FOOD", null);
    }

    private AIResponse handleGroceryQuery(String district, String query, double priceLimit, String fullMsg) {
        List<GroceryProduct> products = groceryProductDAO.getGroceryProducts(district, null);
        boolean cheap = fullMsg.contains("cheap") || fullMsg.contains("affordable") || priceLimit > 0;

        List<GroceryProduct> filtered = products.stream()
                .filter(p -> {
                    if (query != null && !query.isEmpty() && !p.getName().toLowerCase().contains(query.toLowerCase())) return false;
                    if (priceLimit > 0 && p.getPrice() > priceLimit) return false;
                    return true;
                }).collect(Collectors.toList());

        if (cheap) filtered.sort(Comparator.comparingDouble(GroceryProduct::getPrice));

        if (filtered.isEmpty()) {
            if (query != null && !query.isEmpty() && !products.isEmpty()) {
                String list = products.stream().limit(5)
                        .map(p -> "• **" + p.getName() + "** — ₹" + p.getPrice() + "/" + p.getUnitType() + " @ " + p.getStoreName())
                        .collect(Collectors.joining("\n"));
                return new AIResponse("🛒 I couldn't find \"" + query + "\" but here's what's available in " + capitalize(district) + ":\n\n" + list, "NAVIGATE_GROCERY", null);
            }
            return new AIResponse("🛒 No grocery products found in " + capitalize(district) + ". Try our Grocery section!", "NAVIGATE_GROCERY", null);
        }

        String itemWord = (query != null && !query.isBlank()) ? query : "these items";
        String list = filtered.stream().limit(5)
                .map(p -> "• **" + p.getName() + "** — ₹" + p.getPrice() + "/" + p.getUnitType() + " @ " + p.getStoreName())
                .collect(Collectors.joining("\n"));
        return new AIResponse("Yes! " + capitalize(itemWord) + " is available in " + capitalize(district)
                + " at " + filtered.get(0).getStoreName() + ".\n\n" + list, "NAVIGATE_GROCERY", null);
    }

    private AIResponse handleMedicineQuery(String district, String query, double priceLimit, String fullMsg) {
        if ("pharmacy".equalsIgnoreCase(query) || fullMsg.contains("pharmacy") || fullMsg.contains("medical shop")) {
            List<Pharmacy> pharmacies = pharmacyDAO.getPharmacies(district);
            if (pharmacies.isEmpty()) {
                return new AIResponse("💊 No pharmacies found in " + capitalize(district) + " right now.", "NAVIGATE_MEDICINE", null);
            }
            String list = pharmacies.stream().limit(4)
                    .map(p -> "• **" + p.getName() + "** — " + p.getLocation() + " ⭐ " + p.getRating())
                    .collect(Collectors.joining("\n"));
            return new AIResponse("💊 Nearby pharmacies in " + capitalize(district) + ":\n\n" + list, "NAVIGATE_MEDICINE", null);
        }

        List<MedicineProduct> products = medicineProductDAO.getMedicineProducts(district, null);
        boolean cheap = fullMsg.contains("cheap") || fullMsg.contains("under") || priceLimit > 0;

        List<MedicineProduct> filtered = products.stream()
                .filter(p -> {
                    if (query != null && !query.isEmpty() && !p.getName().toLowerCase().contains(query.toLowerCase())) return false;
                    if (priceLimit > 0 && p.getPrice() > priceLimit) return false;
                    return true;
                }).collect(Collectors.toList());

        if (cheap) filtered.sort(Comparator.comparingDouble(MedicineProduct::getPrice));

        if (filtered.isEmpty()) {
            if (query != null && !query.isEmpty() && !products.isEmpty()) {
                String list = products.stream().limit(5)
                        .map(p -> "• **" + p.getName() + "** (" + p.getDosage() + ") — ₹" + p.getPrice())
                        .collect(Collectors.joining("\n"));
                return new AIResponse("💊 I couldn't find \"" + query + "\" but here's what's available in " + capitalize(district) + ":\n\n" + list, "NAVIGATE_MEDICINE", null);
            }
            return new AIResponse("💊 No medicines found in " + capitalize(district) + ". Browse our Medicine section!", "NAVIGATE_MEDICINE", null);
        }

        String itemWord = (query != null && !query.isBlank()) ? query : "these medicines";
        String list = filtered.stream().limit(5)
                .map(p -> "• **" + p.getName() + "** (" + p.getDosage() + ") — ₹" + p.getPrice())
                .collect(Collectors.joining("\n"));
        return new AIResponse("Yes! " + capitalize(itemWord) + " is available in " + capitalize(district)
                + " — I found " + filtered.size() + " matching " + (filtered.size() == 1 ? "medicine" : "medicines")
                + ", including **" + filtered.get(0).getName() + "**.\n\n" + list, "NAVIGATE_MEDICINE", null);
    }

    // ── COURIER QUERY (reuses DeliveryFeeCalculator + platform settings, no hardcoding) ──
    private AIResponse handleCourierQuery(String district) {
        try {
            DeliveryFeeBreakdown breakdown = deliveryFeeCalculator.calculateDeliveryFee(
                    "courier", new BigDecimal("3"), BigDecimal.ZERO, false, district);
            BigDecimal radius = breakdown.getServiceRadiusKm();
            BigDecimal baseFee = breakdown.getBaseFee();
            BigDecimal maxFee = breakdown.getMaxDeliveryFee();
            BigDecimal baseDistance = platformSettings.getDecimal("delivery.courier.base_distance_km");
            BigDecimal platformPct = platformSettings.getDecimal("settlement.courier.platform_fee_pct");
            BigDecimal platformFloor = platformSettings.getDecimal("settlement.courier.platform_floor");
            String eta = breakdown.getEstimatedDeliveryTime() != null ? breakdown.getEstimatedDeliveryTime() : "45-70 mins";

            if (radius != null && radius.signum() > 0 && baseFee != null && baseFee.signum() > 0) {
                String feeInfo = "• Base fee: ₹" + plain(baseFee)
                        + (baseDistance.signum() > 0 ? " (first " + plain(baseDistance) + " km)" : "") + "\n"
                        + "• Max fee: ₹" + plain(maxFee) + "\n";
                String partnerInfo = "";
                if (platformPct.signum() > 0) {
                    partnerInfo = "• Platform service charge: " + plain(platformPct) + "%"
                            + (platformFloor.signum() > 0 ? " (min ₹" + plain(platformFloor) + ")" : "")
                            + " — the rest goes to your delivery partner\n";
                }
                return new AIResponse(
                    "📦 Courier & parcel delivery is live in " + capitalize(district) + "!\n\n"
                        + "• Service radius: up to " + plain(radius) + " km\n"
                        + feeInfo
                        + partnerInfo
                        + "• Estimated delivery: " + eta + "\n\n"
                        + "Open the Courier section to book a pickup and drop address!",
                    "NAVIGATE_COURIER", null);
            }
        } catch (Exception e) {
            // settings not seeded → fall through to generic message
        }
        return new AIResponse(
            "📦 Courier & parcel service is available across every district we serve.\n\n"
                + "Open the Courier section to book a pickup and drop address!",
            "NAVIGATE_COURIER", null);
    }

    private String plain(BigDecimal value) {
        return value == null ? "0" : value.stripTrailingZeros().toPlainString();
    }

    // ── INTENT DETECTION & ROUTING (GEMINI STRICT JSON) ───────────────────────

    private static final Set<String> VALID_INTENTS = Set.of(
            IntentResult.SEARCH_FOOD,
            IntentResult.SEARCH_GROCERY,
            IntentResult.SEARCH_MEDICINE,
            IntentResult.TRACK_ORDER,
            IntentResult.BOOK_COURIER,
            IntentResult.REPEAT_ORDER,
            IntentResult.NEARBY_PHARMACY,
            IntentResult.GENERAL_APP_HELP,
            IntentResult.PLATFORM_INFO_SERVICES,
            IntentResult.PLATFORM_INFO_DELIVERY_FEE,
            IntentResult.PLATFORM_INFO_RADIUS,
            IntentResult.COUNT_RESTAURANTS,
            IntentResult.COUNT_GROCERY_STORES,
            IntentResult.COUNT_PHARMACIES,
            IntentResult.COUNT_DISTRICTS_COVERED,
            IntentResult.FILTER_CHEAPEST_FOOD,
            IntentResult.FILTER_CHEAPEST_GROCERY,
            IntentResult.CHECK_STORE_OPEN_NOW,
            IntentResult.ADDRESS_HELP,
            IntentResult.FAQ_QUESTION
    );

    // ── LOCAL KEYWORD ROUTING (word-boundary, offline-first) ──────────────────
    // These term sets power the cheap keyword router AND the local intent
    // classifier, so natural phrasings like "I want to buy rice", "need
    // paracetamol" or "get some groceries" are answered without Gemini.
    private static final String[] GROCERY_TERMS = {
            "grocery", "groceries", "supermarket", "vegetable", "vegetables", "veggie", "veggies",
            "fruit", "fruits", "banana", "bananas", "apple", "apples", "mango", "mangoes",
            "rice", "atta", "flour", "oil", "dal", "pulses", "onion", "onions", "potato",
            "potatoes", "tomato", "tomatoes", "milk", "bread", "eggs", "sugar", "salt",
            "snack", "snacks", "chips", "biscuit", "biscuits", "soap", "detergent", "shampoo",
            "spice", "spices", "grocer", "kirana", "grocery store"
    };
    private static final String[] MEDICINE_TERMS = {
            "medicine", "medicines", "medication", "med", "meds", "tablet", "tablets", "pill", "pills",
            "paracetamol", "dolo", "dolo 650", "ibuprofen", "aspirin", "crocin", "calpol",
            "syrup", "cough", "fever", "fever medicine", "painkiller", "pain killer", "antibiotic",
            "drug", "drugs", "pharmacy", "pharma", "medical", "medical store", "medical shop",
            "chemist", "first aid", "bandage", "vitamin", "vitamins", "supplement", "supplements"
    };
    private static final String[] FOOD_TERMS = {
            "food", "restaurant", "restaurants", "hotel", "hotel", "biryani", "biryani's",
            "burger", "burgers", "pizza", "pasta", "noodle", "noodles", "fried rice",
            "meal", "meals", "lunch", "dinner", "breakfast", "snack", "snacks",
            "chicken", "mutton", "paneer", "veg", "non-veg", "non veg", "curry", "dosa",
            "idli", "parotta", "tiffin", "food delivery", "order food", "order food"
    };
    // Topics Anywhere genuinely cannot answer. Without this guard the local
    // classifier misreads them as product searches (e.g. "weather" → food list)
    // because partner product names embed the district name.
    private static final String[] OUT_OF_SCOPE_TERMS = {
            "weather", "temperature", "rain", "raining", "forecast", "humidity", "wind",
            "cricket", "football", "score", "match", "news", "headlines", "election",
            "stock market", "share price", "horoscope", "movie", "song",
            "government", "govt", "scheme", "passport", "aadhaar", "pan card",
            "job", "jobs", "salary", "rent", "loan", "emi", "insurance"
    };

    private static final String[] FOOD_SEARCH_TERMS = {
            "restaurant", "hotel", "best", "top", "nearby", "available"
    };
    private static final String[] GROCERY_SEARCH_TERMS = {
            "show", "need", "want", "buy", "order", "get", "find", "list", "some", "price", "cost"
    };
    private static final String[] MEDICINE_SEARCH_TERMS = {
            "show", "need", "want", "buy", "order", "get", "find", "list", "some", "price", "cost"
    };

    private static boolean hasAnyWord(String lower, String... terms) {
        if (lower == null || lower.isBlank()) return false;
        for (String t : terms) {
            if (t == null || t.isEmpty()) continue;
            if (lower.matches("(?i).*\\b" + Pattern.quote(t) + "\\b.*")) return true;
        }
        return false;
    }

    private static boolean hasAnyWord(String lower, String[]... groups) {
        for (String[] group : groups) {
            if (hasAnyWord(lower, group)) return true;
        }
        return false;
    }

    // Pulls the item name out of a natural phrase, e.g.
    // "I want to buy 2 kg tomatoes" -> "tomatoes". Removes the words that only
    // signal intent so the remaining phrase is the search term.
    private String extractSearchTerm(String msg) {
        if (msg == null) return "";
        String t = msg.toLowerCase().replaceAll("[^a-z0-9 ]", " ").replaceAll("\\s+", " ").trim();
        for (String stop : new String[]{
                "i want", "i need", "can i", "can", "could you", "would you", "do you have", "do you sell", "please", "show me",
                "show", "need", "want", "buy", "order", "get", "find", "list", "search",
                "some", "any", "the", "a", "an", "for", "of", "with", "and", "or", "to", "me",
                "grocery", "groceries", "supermarket", "medicine", "medicines", "tablet",
                "food", "please", "best", "top", "cheap", "cheapest", "affordable", "price", "cost",
                "available", "nearby", "in", "district", "today", "please", "thank"
        }) {
            t = t.replaceAll("(?i)\\b" + Pattern.quote(stop) + "\\b", " ").replaceAll("\\s+", " ").trim();
        }
        // District names identify the catalog to search; they are never product names.
        for (String district : supportedDistricts()) {
            t = t.replaceAll("(?i)\\b" + Pattern.quote(district) + "\\b", " ")
                    .replaceAll("\\s+", " ").trim();
        }
        // drop quantity/number words ("2", "kg", "two", "bottle", "pack")
        t = t.replaceAll("(?i)\\b(kg|gm|g|ml|l|bottle|pack|packet|box|pieces|piece)\\b", " ").replaceAll("\\s+", " ").trim();
        if (t.matches(".*\\d.*")) {
            t = t.replaceAll("\\d+\\s*", "").replaceAll("\\s+", " ").trim();
        }
        return t;
    }

    // Offline classifier: routes free-form product phrases to the right service
    // by scoring the message against each service's product vocabulary (item
    // names + category terms). Returns null when nothing matches — in that case
    // Gemini intent detection takes over.
    private AIResponse handleLocalIntent(String msg, String district) {
        if (msg == null) return null;
        String lower = msg.toLowerCase();

        double groceryScore = scoreAgainst(lower, groceryProductDAO.getGroceryProducts(district, null), GroceryProduct::getName);
        double medicineScore = scoreAgainst(lower, medicineProductDAO.getMedicineProducts(district, null), MedicineProduct::getName);
        double foodScore = scoreAgainst(lower, foodProductDAO.getFoodProducts(district), FoodProduct::getName);

        if (groceryScore == 0 && medicineScore == 0 && foodScore == 0) {
            return null;
        }

        if (medicineScore >= groceryScore && medicineScore >= foodScore && medicineScore > 0) {
            return handleMedicineQuery(district, extractSearchTerm(lower), -1.0, lower);
        }
        if (groceryScore >= foodScore && groceryScore > 0) {
            return handleGroceryQuery(district, extractSearchTerm(lower), -1.0, lower);
        }
        return handleFoodQuery(district, extractSearchTerm(lower), -1.0, lower);
    }

    private <T> double scoreAgainst(String lower, List<T> items, java.util.function.Function<T, String> nameOf) {
        if (items == null || items.isEmpty()) return 0;
        double score = 0;
        int counted = 0;
        for (T item : items) {
            String name = nameOf.apply(item);
            if (name == null) continue;
            String lowerName = name.toLowerCase().trim();
            if (lowerName.isEmpty()) continue;
            if (lower.contains(lowerName)) {
                score += lowerName.length();
                counted++;
            } else {
                // Partial match: any significant word of the product name appears verbatim.
                // District / partner tokens are skipped — product names embed them
                // ("Salem RR Biryani Ghee Roast Dosa"), so matching on "salem" would
                // classify every district-scoped question as a product search.
                String[] tokens = lowerName.split("\\s+");
                for (String token : tokens) {
                    if (token.length() <= 2 || isGenericNameToken(token)) continue;
                    if (lower.contains(token)) {
                        score += token.length();
                        counted++;
                        break;
                    }
                }
            }
        }
        // normalize so a dense catalog doesn't dominate a sparse one
        return counted > 0 ? score / items.size() : 0;
    }

    /** Tokens that carry no product signal: district names and generic partner words. */
    private static final Set<String> GENERIC_NAME_TOKENS = Set.of(
            "restaurant", "restaurants", "mess", "hotel", "kitchen", "bhavan", "store",
            "stores", "mart", "supermarket", "pharmacy", "medical", "medicals", "chemist",
            "special", "fresh", "daily", "needs", "provisions", "organic", "central"
    );

    private boolean isGenericNameToken(String token) {
        if (token == null || token.length() <= 2) return true;
        if (GENERIC_NAME_TOKENS.contains(token)) return true;
        // Any district name is a location token, never a product token.
        return supportedDistricts().contains(token);
    }

    private AIResponse routeIntent(String lowerMessage, Integer userId, String district, String originalMessage) {
        IntentResult intent = detectIntent(lowerMessage, district);
        String name = intent.getIntentOrDefault();
        if (!VALID_INTENTS.contains(name)) {
            return null;
        }

        AIResponse raw = switch (name) {
            case IntentResult.SEARCH_FOOD -> {
                String q = safe(intent.getItem());
                if (q.contains("restaurant") || q.contains("hotel") || q.contains("best") || q.contains("top")) {
                    yield handleRestaurantQuery(resolveIntentDistrict(intent, district), originalMessage);
                }
                yield handleFoodQuery(resolveIntentDistrict(intent, district), q, -1.0, originalMessage);
            }
            case IntentResult.SEARCH_GROCERY -> handleGroceryQuery(resolveIntentDistrict(intent, district), safe(intent.getItem()), -1.0, originalMessage);
            case IntentResult.SEARCH_MEDICINE -> handleMedicineQuery(resolveIntentDistrict(intent, district), safe(intent.getItem()), -1.0, originalMessage);
            case IntentResult.TRACK_ORDER -> handleTrackOrder(userId);
            case IntentResult.BOOK_COURIER -> handleCourierQuery(resolveIntentDistrict(intent, district));
            case IntentResult.NEARBY_PHARMACY -> handleMedicineQuery(resolveIntentDistrict(intent, district), "pharmacy", -1.0, originalMessage);
            case IntentResult.REPEAT_ORDER -> handleRepeatOrder(userId);
            case IntentResult.GENERAL_APP_HELP -> new AIResponse("General Anywhere information from the system prompt.");
            case IntentResult.PLATFORM_INFO_SERVICES -> new AIResponse("Anywhere offers 4 district-based services with verified local partners: 1) Food Delivery from local restaurants (" + radiusText("food") + " radius), 2) Grocery Delivery from local stores (" + radiusText("grocery") + " radius), 3) Medicine Delivery from pharmacies (" + radiusText("medicine") + " radius), 4) Courier Service for parcels (" + radiusText("courier") + "). No warehouses, no central inventory - all orders fulfilled directly from local shops.");
            case IntentResult.PLATFORM_INFO_DELIVERY_FEE -> new AIResponse("Delivery fees are calculated from the current platform settings and route. The exact amount and any applicable offer are shown at checkout before you confirm.");
            case IntentResult.PLATFORM_INFO_RADIUS -> new AIResponse("Delivery radius is measured from each specific shop: Food " + radiusText("food") + " from the restaurant, Grocery " + radiusText("grocery") + " from the store, Medicine " + radiusText("medicine") + " from the pharmacy, Courier " + radiusText("courier") + " between pickup and drop points. If your address is outside the radius, you'll see a 'delivery not available' message.");
            case IntentResult.COUNT_RESTAURANTS -> handleCountQuery(resolveIntentDistrict(intent, district), "restaurant");
            case IntentResult.COUNT_GROCERY_STORES -> handleCountQuery(resolveIntentDistrict(intent, district), "grocery");
            case IntentResult.COUNT_PHARMACIES -> handleCountQuery(resolveIntentDistrict(intent, district), "pharmacy");
            case IntentResult.COUNT_DISTRICTS_COVERED -> handleCountDistricts();
            case IntentResult.FILTER_CHEAPEST_FOOD -> handleFoodQuery(resolveIntentDistrict(intent, district), safe(intent.getItem()), 0, "cheap " + originalMessage);
            case IntentResult.FILTER_CHEAPEST_GROCERY -> handleGroceryQuery(resolveIntentDistrict(intent, district), safe(intent.getItem()), 0, "cheap " + originalMessage);
            case IntentResult.CHECK_STORE_OPEN_NOW -> handleStoreOpenCheck(resolveIntentDistrict(intent, district), safe(intent.getItem()), originalMessage);
            case IntentResult.ADDRESS_HELP -> new AIResponse("To add a delivery address: go to Profile > Addresses > tap 'Add New Address' > fill in your details (title, full address, city, pincode) > save. You can save multiple addresses for home, office, etc.");
            case IntentResult.FAQ_QUESTION -> handleFaqQuestion(originalMessage);
            default -> null;
        };

        if (raw == null) {
            return null;
        }

        // Second pass: have Gemini phrase the real results naturally (except FAQ_QUESTION which is handled by RAG/LLM).
        if (!IntentResult.FAQ_QUESTION.equals(name)) {
            String phrased = phraseReply(buildSystemContext(userId, district), originalMessage, raw.getReply());
            if (phrased != null && !phrased.isEmpty()) {
                raw.setReply(phrased);
            }
        }
        return raw;
    }

    private IntentResult detectIntent(String lowerMessage, String district) {
        String raw;
        if ("ollama".equals(aiProvider)) {
            String prompt = ANYWHERE_SYSTEM_PROMPT + "\n\n"
                    + "Extract the user's intent from their message. Return ONLY valid JSON, no other text, no explanation:\n"
                    + "{ \"intent\": \"INTENT_NAME\", \"item\": \"value or null\", \"district\": \"value or null\", \"orderId\": \"value or null\" }\n"
                    + "Allowed intents: SEARCH_FOOD, SEARCH_GROCERY, SEARCH_MEDICINE, TRACK_ORDER, BOOK_COURIER, REPEAT_ORDER, NEARBY_PHARMACY, GENERAL_APP_HELP, PLATFORM_INFO_SERVICES, PLATFORM_INFO_DELIVERY_FEE, PLATFORM_INFO_RADIUS, COUNT_RESTAURANTS, COUNT_GROCERY_STORES, COUNT_PHARMACIES, COUNT_DISTRICTS_COVERED, FILTER_CHEAPEST_FOOD, FILTER_CHEAPEST_GROCERY, CHECK_STORE_OPEN_NOW, ADDRESS_HELP, FAQ_QUESTION, UNKNOWN\n"
                    + "Routing rules:\n"
                    + "- Send general policy, FAQ, refund, cancellation, out of stock, prescription verification/rules, how partners are paid, commission, coupons, districts covered, and how-it-works 'what/how/can I' questions to FAQ_QUESTION.\n"
                    + "- Questions searching for a specific shop, restaurant, dish, product, price, order status, or count keep their existing SQL intents (SEARCH_FOOD, SEARCH_GROCERY, SEARCH_MEDICINE, COUNT_*, TRACK_ORDER, etc.).\n"
                    + "- Only select a specific intent if the message clearly and confidently matches it. If uncertain, return UNKNOWN rather than guessing the closest one.\n"
                    + "Current district context: " + capitalize(district) + "\n"
                    + "User message: \"" + escapePromptText(lowerMessage) + "\"";
            raw = ollamaClient.generate(prompt);
        } else {
            String system = "You classify Anywhere app user messages into exactly one intent. " +
                    "Allowed intents: SEARCH_FOOD, SEARCH_GROCERY, SEARCH_MEDICINE, TRACK_ORDER, " +
                    "BOOK_COURIER, REPEAT_ORDER, NEARBY_PHARMACY, GENERAL_APP_HELP, PLATFORM_INFO_SERVICES, PLATFORM_INFO_DELIVERY_FEE, PLATFORM_INFO_RADIUS, COUNT_RESTAURANTS, COUNT_GROCERY_STORES, COUNT_PHARMACIES, COUNT_DISTRICTS_COVERED, FILTER_CHEAPEST_FOOD, FILTER_CHEAPEST_GROCERY, CHECK_STORE_OPEN_NOW, ADDRESS_HELP, FAQ_QUESTION, UNKNOWN. " +
                    "General policy, FAQ, refund, cancellation, out of stock, partner payout, commission, prescription rules belong to FAQ_QUESTION. Specific product/food searches and counts keep their specific search/count intents. " +
                    "Return STRICT JSON only with fields: intent, item (product/dish name or null), " +
                    "district (explicit district name or null), orderId (order number if mentioned, else null). " +
                    "Current district context: " + capitalize(district) + ".";
            raw = geminiClient.generateJson(system, lowerMessage, 120);
        }
        if (raw == null || raw.isBlank()) {
            return unknownIntent();
        }
        String json = extractJsonObject(raw);
        try {
            return objectMapper.readValue(json, IntentResult.class);
        } catch (Exception e) {
            System.err.println("Intent JSON parse failed: " + json + " -> " + e.getMessage());
            return unknownIntent();
        }
    }

    private String phraseReply(String systemContext, String userMessage, String resultText) {
        if ("ollama".equals(aiProvider)) {
            String prompt = ANYWHERE_SYSTEM_PROMPT + "\n\n"
                    + "Real data retrieved:\n" + (resultText == null ? "No database lookup was required." : resultText) + "\n\n"
                    + "User asked: \"" + escapePromptText(userMessage) + "\"\n"
                    + "Reply naturally and helpfully using ONLY the real data provided above. "
                    + "Do not invent any restaurant names, prices, or details not present in the real data. "
                    + "If the real data is empty or says no results found, tell the user honestly that nothing was found.";
            return ollamaClient.generate(prompt);
        }
        String prompt = "The Anywhere assistant produced this result for the user's request. " +
                "Rephrase it as a friendly, concise (2-4 sentences) natural-language reply. " +
                "Keep all product names, prices and facts intact. Do not add information that is not in the result.\n\n" +
                "User request: " + userMessage + "\n\nResult:\n" + resultText;
        return geminiClient.generateText(systemContext + " You are the Anywhere AI Assistant.", prompt, 200);
    }

    private String resolveIntentDistrict(IntentResult intent, String fallbackDistrict) {
        if (intent.getDistrict() != null && !intent.getDistrict().isBlank()) {
            String resolved = resolveDistrictFromMessage(intent.getDistrict().toLowerCase(), fallbackDistrict);
            if (resolved != null) {
                return resolved;
            }
        }
        return fallbackDistrict;
    }

    private IntentResult unknownIntent() {
        IntentResult result = new IntentResult();
        result.setIntent(IntentResult.UNKNOWN);
        return result;
    }

    private String extractJsonObject(String raw) {
        if (raw == null) return "";
        String trimmed = raw.trim();
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceAll("(?s)^```(?:json)?\\s*", "").replaceAll("\\s*```$", "");
        }
        int start = trimmed.indexOf('{');
        int end = trimmed.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return trimmed.substring(start, end + 1);
        }
        return trimmed;
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private String escapePromptText(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\").replace("\"", "\\\"")
                .replace("\r", " ").replace("\n", " ");
    }

    private String unknownIntentFallback() {
        return "I can help you with:\n"
                + "- Finding food, groceries, or medicine near you\n"
                + "- Tracking your orders\n"
                + "- Booking a courier\n"
                + "- General questions about Anywhere's services\n\n"
                + "Try something like: 'Show biryani in Karaikudi' or 'Track my order'.";
    }

    /** Honest, non-guessing reply for topics outside the platform's scope. */
    private String outOfScopeReply(String msg) {
        if (hasAnyWord(msg, "government", "govt", "scheme", "passport", "aadhaar", "pan card")) {
            return "Anywhere supports Food Delivery, Grocery Delivery, Medicine Delivery, and Courier Service only — "
                    + "I can't help with government schemes or ID services. I can help you find local shops, "
                    + "products, courier bookings, and your orders.";
        }
        return "Sorry, I don't have live data for that — I'm the Anywhere assistant for Food, Grocery, Medicine "
                + "and Courier, so I can't answer questions about weather, scores, news, jobs or similar topics.\n\n"
                + "I can help you with:\n"
                + "- Food, grocery and medicine availability in your district\n"
                + "- Courier rates and booking\n"
                + "- Your orders, cart and saved addresses";
    }

    // ── REPEAT ORDER HANDLER ────────────────────────────────────────────────

    private AIResponse handleRepeatOrder(Integer userId) {
        if (userId == null) {
            return new AIResponse("Please sign in first to repeat your last order.", "NAVIGATE_SIGNIN", null);
        }
        List<Order> orders = orderDAO.findByUserId(userId);
        if (orders.isEmpty()) {
            return new AIResponse("You have no previous orders to repeat.", "NAVIGATE_ORDERS", null);
        }
        Order lastOrder = orders.get(0);
        if (lastOrder.getItems() == null || lastOrder.getItems().isEmpty()) {
            return new AIResponse("Your last order has no items to add.", "NAVIGATE_ORDERS", null);
        }
        for (OrderItem item : lastOrder.getItems()) {
            String serviceType = item.getServiceType() == null ? "FOOD" : item.getServiceType().toUpperCase();
            double price = item.getPrice() == null ? 0 : item.getPrice().doubleValue();
            addToCartDb(userId, serviceType, item.getProductId(), item.getQuantity(), item.getProductName(),
                    price, null, null);
        }
        return new AIResponse("🔄 Your last order items have been added to the cart. Review and place it again!",
                "NAVIGATE_CART", null);
    }

    // ── DB HELPERS ─────────────────────────────────────────────────────────────

    private void addToCartDb(int userId, String serviceType, int productId, int quantity,
                             String productName, double price, String imageUrl, String providerName) {
        String checkSql = "SELECT id, quantity FROM cart WHERE user_id = ? AND service_type = ? AND product_id = ?";
        List<Map<String, Object>> existing = jdbcTemplate.queryForList(checkSql, userId, serviceType, productId);
        if (!existing.isEmpty()) {
            int id = ((Number) existing.get(0).get("id")).intValue();
            int currentQty = ((Number) existing.get(0).get("quantity")).intValue();
            jdbcTemplate.update("UPDATE cart SET quantity = ? WHERE id = ?", currentQty + quantity, id);
        } else {
            // cart table only stores: user_id, service_type, product_id, quantity
            // Product details (name, price, image, etc.) are resolved at read time via JOINs
            String insertSql = """
                INSERT INTO cart
                (user_id, service_type, product_id, quantity)
                VALUES (?, ?, ?, ?)
                """;
            jdbcTemplate.update(insertSql, userId, serviceType, productId, quantity);
        }
    }

    // ── STRING UTILS ──────────────────────────────────────────────────────────

    private String resolveDistrictFromMessage(String message, String fallbackDistrict) {
        for (String district : supportedDistricts()) {
            if (message.contains(district)) {
                return "trichy".equals(district) ? "tiruchirappalli" : district;
            }
        }
        return fallbackDistrict;
    }

    private String capitalize(String input) {
        if (input == null || input.isEmpty()) return "";
        return Character.toUpperCase(input.charAt(0)) + input.substring(1).toLowerCase();
    }

    private String formatStatus(String status) {
        if (status == null) return "Unknown";
        return Arrays.stream(status.split("_"))
                .map(this::capitalize)
                .collect(Collectors.joining(" "));
    }

    // ── NEW INTENT HELPERS ────────────────────────────────────────────────────────

    private AIResponse handleCountQuery(String district, String type) {
        String sql;
        String displayName;
        if ("restaurant".equals(type)) {
            sql = "SELECT COUNT(*) FROM restaurants WHERE (? IS NULL OR LOWER(district) = LOWER(?))";
            displayName = "restaurants";
        } else if ("grocery".equals(type)) {
            sql = "SELECT COUNT(*) FROM grocery_stores WHERE (? IS NULL OR LOWER(district) = LOWER(?))";
            displayName = "grocery stores";
        } else if ("pharmacy".equals(type)) {
            sql = "SELECT COUNT(*) FROM pharmacies WHERE (? IS NULL OR LOWER(district) = LOWER(?))";
            displayName = "pharmacies";
        } else {
            return new AIResponse("Unknown count type: " + type);
        }
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, district, district);
        return new AIResponse("We have " + (count != null ? count : 0) + " " + displayName + " in " + capitalize(district) + ".");
    }

    private AIResponse handleCountDistricts() {
        Integer count = supportedDistricts().size();
        try {
            count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM districts", Integer.class);
        } catch (Exception ignored) {
            // keep the set size as a fallback
        }
        return new AIResponse("Anywhere currently covers " + (count != null ? count : 0) + " districts across Tamil Nadu.");
    }

    /** Human-readable service radius pulled from platform_settings (never hardcoded). */
    private String radiusText(String service) {
        try {
            BigDecimal radius = platformSettings.getRequiredDecimal("delivery." + service + ".radius_km");
            return radius.stripTrailingZeros().toPlainString() + " km";
        } catch (Exception ignored) {
            return "configurable";
        }
    }

    private AIResponse handleStoreOpenCheck(String district, String item, String fullMsg) {
        // Store hours are not currently modeled in the database.
        // We can only check if there are active stores in the district.
        String type = "store";
        if (fullMsg.contains("restaurant") || fullMsg.contains("food")) type = "restaurant";
        else if (fullMsg.contains("grocery")) type = "grocery store";
        else if (fullMsg.contains("pharmacy") || fullMsg.contains("medicine")) type = "pharmacy";

        String sql;
        if ("restaurant".equals(type)) {
            sql = "SELECT COUNT(*) FROM restaurants WHERE (? IS NULL OR LOWER(district) = LOWER(?))";
        } else if ("grocery store".equals(type)) {
            sql = "SELECT COUNT(*) FROM grocery_stores WHERE (? IS NULL OR LOWER(district) = LOWER(?))";
        } else {
            sql = "SELECT COUNT(*) FROM pharmacies WHERE (? IS NULL OR LOWER(district) = LOWER(?))";
        }
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, district, district);
        if (count != null && count > 0) {
            return new AIResponse("There are " + count + " active " + type + (count != 1 ? "s" : "") + " in " + capitalize(district) + " right now. Store hours vary — check the app for specific timings.");
        }
        return new AIResponse("No active " + type + (count != 1 ? "s" : "") + " found in " + capitalize(district) + " at the moment.");
    }

    private AIResponse handleFaqQuestion(String originalMessage) {
        List<RetrievedChunk> chunks;
        try {
            chunks = knowledgeRetrievalService.retrieve(originalMessage);
        } catch (ChromaUnavailableException e) {
            return new AIResponse("Help articles are unavailable right now. Please try again shortly.");
        }

        if (chunks.isEmpty()) {
            return new AIResponse("I don't have that information yet. You can contact support at 98765 43210.");
        }

        String context = chunks.stream()
                .map(RetrievedChunk::document)
                .collect(Collectors.joining("\n\n"));

        String systemPrompt = "Answer only using the context below. If the answer is not in the context, say you don't know. Keep it under 3 sentences. Do not add facts.";
        String userPrompt = "Context:\n" + context + "\n\nQuestion: " + originalMessage;

        String answer;
        try {
            if ("ollama".equals(aiProvider)) {
                answer = ollamaClient.generateWithSystem(systemPrompt, userPrompt);
            } else {
                answer = geminiClient.generateText(systemPrompt + "\n\nContext:\n" + context, originalMessage, 200);
            }
        } catch (Exception exception) {
            return new AIResponse("I found the relevant help article, but the answer service is unavailable right now. Please try again shortly.");
        }
        if (answer == null || answer.isBlank()) {
            return new AIResponse("I found the relevant help article, but I could not generate a reliable answer. Please try again shortly.");
        }

        // Return the answer plus the source question names (e.g. "Source: Refund policy")
        Set<String> sources = chunks.stream()
                .map(RetrievedChunk::source)
                .filter(s -> s != null && !s.isBlank())
                .collect(Collectors.toCollection(LinkedHashSet::new));

        String replyWithSource = answer;
        if (!sources.isEmpty()) {
            replyWithSource = answer.trim() + "\n\nSource: " + String.join(", ", sources);
        }

        return new AIResponse(replyWithSource);
    }

    private boolean isFaqOrPolicyQuestion(String msg) {
        if (msg == null) return false;
        String m = msg.toLowerCase().trim();

        // Specific shop / item / count / cart / order / tracking queries should stay with their SQL intents
        if (m.matches(".*\\b(in|near|at|from)\\s+[a-z]+.*") && (hasAnyWord(m, "biryani", "dosa", "food", "grocery", "medicine", "restaurant", "store", "pharmacy"))) {
            return false;
        }
        if (m.matches(".*\\b(how many|count)\\b.*")) {
            return false;
        }

        // Policy / FAQ keywords and patterns
        if (m.contains("refund") || m.contains("refund policy") || m.contains("money back")) return true;
        if (m.contains("cancel my order") || m.contains("cancellation policy") || m.contains("cancel an order") || m.contains("cancel order")) return true;
        if (m.contains("out of stock") || m.contains("unavailable item")) return true;
        if (m.contains("prescription") || m.contains("prescriptions")) return true;
        if (m.contains("how do delivery partners") || m.contains("delivery partners get paid") || m.contains("partner payout") || m.contains("driver pay")) return true;
        if (m.contains("commission") || m.contains("platform fee") || m.contains("how much commission")) return true;
        if (m.contains("delivery partner") || m.contains("become a partner") || m.contains("shop partner") || m.contains("become a shop") || m.contains("delivery boy")) return true;
        if (m.contains("free delivery threshold") || m.contains("free delivery") || m.contains("service radius")) return true;
        if (m.contains("privacy") || m.contains("data policy") || m.contains("personal data")) return true;
        if (m.contains("coupon") || m.contains("coupons") || m.contains("promo code") || m.contains("discount code")) return true;
        if (m.contains("districts covered") || m.contains("districts do you cover") || m.contains("which districts")) return true;
        if (m.contains("use my location")) return true;
        if (m.contains("cash on delivery") || m.contains("payment methods") || m.contains("payment options")) return true;

        // General questions starting with "what/how/can i/why" that ask about rules/processes
        if (m.matches("^(what|how|can i|why|is there|do you have a policy)\\b.*")) {
            if (m.contains("work") || m.contains("policy") || m.contains("rule") || m.contains("process")
                    || m.contains("fee") || m.contains("radius") || m.contains("paid") || m.contains("pay")
                    || m.contains("cancel") || m.contains("refund") || m.contains("stock") || m.contains("prescription")
                    || m.contains("partner") || m.contains("commission") || m.contains("privacy") || m.contains("location")) {
                return true;
            }
        }

        return false;
    }
}
