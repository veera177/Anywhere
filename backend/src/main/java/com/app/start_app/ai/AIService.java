package com.app.start_app.ai;

import com.app.start_app.food.*;
import com.app.start_app.grocery.*;
import com.app.start_app.medicine.*;
import com.app.start_app.cart.*;
import com.app.start_app.order.*;
import com.app.start_app.user.*;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

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
    private final RestTemplate restTemplate;

    private static final String OLLAMA_URL = "http://localhost:11434/api/chat";

    // Mock agricultural products
    private static final List<AgriProduct> MOCK_AGRI_PRODUCTS = Arrays.asList(
        new AgriProduct(2001, "Hybrid Tomato Seeds", "Seeds", 45.0, "High yield hybrid tomato seeds. Best for home garden and rural farming.", "Fresh Pick", "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=300&q=80"),
        new AgriProduct(2002, "Paddy Seeds (Ponni)", "Seeds", 150.0, "Premium Quality Ponni Paddy seeds for rice farming.", "Top Seller", "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=300&q=80"),
        new AgriProduct(2003, "Organic Vermicompost", "Fertilizers", 80.0, "100% organic earthworm compost for soil enrichment.", "10% OFF", "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=300&q=80"),
        new AgriProduct(2004, "NPK Plant Fertilizer", "Fertilizers", 120.0, "Balanced NPK nitrogen-phosphorus-potassium mix.", "Best Choice", "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=300&q=80"),
        new AgriProduct(2005, "Farming Spade (Steel)", "Farming Tools", 250.0, "Heavy-duty steel spade with sturdy wooden handle.", "Durable", "https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&w=300&q=80"),
        new AgriProduct(2006, "Grass Sickle", "Farming Tools", 95.0, "Traditional sharp curved sickle for crop harvesting.", "Local Craft", "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=300&q=80")
    );

    // Mock Home Services
    private static final List<HomeServiceProvider> MOCK_HOME_SERVICES = Arrays.asList(
        new HomeServiceProvider("Ramesh Kumar", "plumber", "9876543211", 4.8, 250.0),
        new HomeServiceProvider("Vijay Prasad", "electrician", "9876543212", 4.7, 300.0),
        new HomeServiceProvider("Selvam Cleaners", "cleaning", "9876543213", 4.9, 500.0)
    );

    // Mock Government Hospitals
    private static final Map<String, String> GOVT_HOSPITALS = new HashMap<>() {{
        put("salem", "Salem Government Mohan Kumaramangalam Medical College Hospital, Collectorate Road, Salem.");
        put("trichy", "Trichy Government General Hospital, Collector's Office Road, Trichy.");
        put("theni", "Theni Government Medical College & Hospital, K.Vilakku, Theni.");
        put("thanjavur", "Thanjavur Government Medical College Hospital, Medical College Road, Thanjavur.");
        put("kanyakumari", "Kanyakumari Government Medical College Hospital, Asaripallam, Nagercoil.");
        put("pollachi", "Pollachi Government Headquarters Hospital, Pollachi Town.");
        put("ooty", "Ooty Government Headquarters Hospital, Hospital Road, Ooty.");
    }};

    public AIService(JdbcTemplate jdbcTemplate, FoodProductDAO foodProductDAO, RestaurantDAO restaurantDAO,
                     GroceryProductDAO groceryProductDAO, GroceryStoreDAO groceryStoreDAO,
                     MedicineProductDAO medicineProductDAO, PharmacyDAO pharmacyDAO,
                     CartDAO cartDAO, OrderDAO orderDAO, UserDAO userDAO, AddressDAO addressDAO) {
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
        this.restTemplate = new RestTemplate();
    }

    public AIResponse processMessage(AIRequest request) {
        String msg = request.getMessage().trim().toLowerCase();
        Integer userId = request.getUserId();
        String district = request.getDistrict();

        // If district is not provided but userId is, fetch user's district
        if ((district == null || district.isEmpty()) && userId != null) {
            User user = userDAO.getUserById(userId);
            if (user != null) {
                district = user.getDistrict();
            }
        }
        if (district == null) {
            district = "salem"; // default fallback
        }
        district = district.toLowerCase();

        // 1. FAST REGEX PARSING (Avoids Ollama latency for clear commands)
        
        // CLEAR CART
        if (msg.matches(".*\\b(clear|empty)\\b.*\\bcart\\b.*")) {
            if (userId == null) return new AIResponse("Please sign in first to clear your cart.", "NAVIGATE_SIGNIN", null);
            cartDAO.clearCart(userId);
            return new AIResponse("Your shopping cart has been cleared successfully!", "NAVIGATE_CART", null);
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

        // SHOW ORDER HISTORY
        if (msg.matches(".*\\b(order history|my orders|previous orders|past orders|show orders)\\b.*")) {
            if (userId == null) return new AIResponse("Please sign in to view your order history.", "NAVIGATE_SIGNIN", null);
            return new AIResponse("Here is your order history.", "NAVIGATE_ORDERS", null);
        }

        // PROFILE / ADDRESSES
        if (msg.matches(".*\\b(my profile|show profile|user profile|saved address|saved addresses|my addresses)\\b.*")) {
            if (userId == null) return new AIResponse("Please sign in to see your profile details.", "NAVIGATE_SIGNIN", null);
            if (msg.contains("address")) {
                List<Address> addresses = addressDAO.getAddressesByUserId(userId);
                if (addresses.isEmpty()) {
                    return new AIResponse("You do not have any saved addresses. You can add one in your Profile section.", "NAVIGATE_PROFILE", null);
                }
                String addressList = addresses.stream()
                        .map(a -> "- **" + a.getTitle() + "**: " + a.getAddress() + ", " + a.getCity() + " (" + a.getPincode() + ")")
                        .collect(Collectors.joining("\n"));
                return new AIResponse("Here are your saved addresses:\n\n" + addressList, "NAVIGATE_PROFILE", null);
            }
            return new AIResponse("Opening your profile dashboard.", "NAVIGATE_PROFILE", null);
        }

        // BOOK SERVICE (PLUMBER/ELECTRICIAN/CLEANING)
        if (msg.matches(".*\\b(book|need|hire)\\b.*\\b(plumber|electrician|cleaning|cleaner)\\b.*") || msg.matches(".*\\b(plumber|electrician|cleaning)\\b.*")) {
            String serviceType = "plumber";
            if (msg.contains("electrician")) serviceType = "electrician";
            else if (msg.contains("clean")) serviceType = "cleaning";
            return handleBookService(serviceType);
        }

        // ADD TO CART REGEX (e.g., "Add Chicken Biryani to my cart")
        Pattern addPattern = Pattern.compile("add\\s+(.+?)\\s+to\\s+(my\\s+)?cart");
        Matcher addMatcher = addPattern.matcher(msg);
        if (addMatcher.find()) {
            if (userId == null) return new AIResponse("Please sign in first to add items to your cart.", "NAVIGATE_SIGNIN", null);
            String itemQuery = addMatcher.group(1).trim();
            return handleAddToCart(userId, district, itemQuery, 1);
        }

        // 2. FALLBACK SEMANTIC PARSING WITH OLLAMA
        String intentJson = callOllamaClassifier(request.getMessage());
        if (intentJson != null && !intentJson.isEmpty()) {
            try {
                // Parse basic JSON fields using simple string indexing or regex to avoid full jackson library overhead
                String intent = getJsonField(intentJson, "intent");
                String query = getJsonField(intentJson, "query");
                String priceStr = getJsonField(intentJson, "price");
                String qtyStr = getJsonField(intentJson, "quantity");
                String serviceType = getJsonField(intentJson, "serviceType");

                double priceLimit = (priceStr == null || priceStr.equals("null")) ? -1.0 : Double.parseDouble(priceStr);
                int quantity = (qtyStr == null || qtyStr.equals("null")) ? 1 : Integer.parseInt(qtyStr);

                if ("ADD_TO_CART".equals(intent) && query != null && !query.isEmpty()) {
                    if (userId == null) return new AIResponse("Please sign in first to add items to your cart.", "NAVIGATE_SIGNIN", null);
                    return handleAddToCart(userId, district, query, quantity);
                } else if ("CLEAR_CART".equals(intent)) {
                    if (userId == null) return new AIResponse("Please sign in first to clear your cart.", "NAVIGATE_SIGNIN", null);
                    cartDAO.clearCart(userId);
                    return new AIResponse("Your shopping cart has been cleared successfully!", "NAVIGATE_CART", null);
                } else if ("VIEW_CART".equals(intent)) {
                    if (userId == null) return new AIResponse("Please sign in to view your cart.", "NAVIGATE_SIGNIN", null);
                    return handleShowCart(userId);
                } else if ("TRACK_ORDER".equals(intent)) {
                    if (userId == null) return new AIResponse("Please sign in first to track your orders.", "NAVIGATE_SIGNIN", null);
                    return handleTrackOrder(userId);
                } else if ("ORDER_HISTORY".equals(intent)) {
                    if (userId == null) return new AIResponse("Please sign in to view your order history.", "NAVIGATE_SIGNIN", null);
                    return new AIResponse("Here is your order history.", "NAVIGATE_ORDERS", null);
                } else if ("PROFILE_VIEW".equals(intent)) {
                    if (userId == null) return new AIResponse("Please sign in to see your profile details.", "NAVIGATE_SIGNIN", null);
                    return new AIResponse("Opening your profile details.", "NAVIGATE_PROFILE", null);
                } else if ("BOOK_SERVICE".equals(intent)) {
                    return handleBookService(query != null ? query : "plumber");
                } else if ("AGRICULTURE".equals(intent)) {
                    return handleAgricultureQuery(query);
                } else if ("RURAL_HOSPITAL".equals(intent)) {
                    return handleHospitalQuery(district);
                } else if ("RURAL_DELIVERY".equals(intent)) {
                    return new AIResponse("Yes, Anywhere supports village delivery! We deliver to remote rural areas across " + capitalize(district) + " district with local transport networks. Courier and grocery delivery charges vary based on distance.");
                } else if ("FOOD_SEARCH".equals(intent)) {
                    return handleFoodQuery(district, query, priceLimit, msg);
                } else if ("GROCERY_SEARCH".equals(intent)) {
                    return handleGroceryQuery(district, query, priceLimit, msg);
                } else if ("MEDICINE_SEARCH".equals(intent)) {
                    return handleMedicineQuery(district, query, priceLimit, msg);
                }
            } catch (Exception e) {
                // If parsing fails, fall back to general chat
                System.err.println("Failed to parse intent JSON: " + e.getMessage());
            }
        }

        // 3. KEYWORD-BASED FALLBACK (If Ollama is offline or doesn't map the intent)
        if (msg.contains("hospital")) {
            return handleHospitalQuery(district);
        }
        if (msg.contains("pharmacy") || msg.contains("medical shop")) {
            return handleMedicineQuery(district, "pharmacy", -1.0, msg);
        }
        if (msg.contains("seeds") || msg.contains("fertilizer") || msg.contains("farming") || msg.contains("agri")) {
            return handleAgricultureQuery(msg);
        }
        if (msg.contains("biryani") || msg.contains("food") || msg.contains("restaurant") || msg.contains("hotel")) {
            return handleFoodQuery(district, msg.contains("biryani") ? "biryani" : "", -1.0, msg);
        }
        if (msg.contains("grocery") || msg.contains("vegetables") || msg.contains("fruits")) {
            return handleGroceryQuery(district, "", -1.0, msg);
        }
        if (msg.contains("medicine") || msg.contains("tablet") || msg.contains("syrup")) {
            return handleMedicineQuery(district, "", -1.0, msg);
        }

        // 4. CONVERSATIONAL REPLY GENERATION USING OLLAMA (If general chat or no intent matched)
        String llmReply = callOllamaGeneralChat(request.getMessage());
        if (llmReply != null && !llmReply.isEmpty()) {
            return new AIResponse(llmReply);
        }

        // 5. HARDCODED SYSTEM FALLBACK
        return new AIResponse("Hello! I am your Anywhere AI Assistant. I can help you search restaurants, order food/groceries/medicines, track your orders, book plumbers/electricians, and find farming services. How can I help you today?");
    }

    // Helper handlers

    private AIResponse handleShowCart(int userId) {
        List<CartItem> cartItems = cartDAO.getCartByUser(userId);
        if (cartItems.isEmpty()) {
            return new AIResponse("Your cart is currently empty. You can ask me to add products to your cart!", "NAVIGATE_CART", null);
        }
        double total = cartItems.stream().mapToDouble(item -> item.getPrice() * item.getQuantity()).sum();
        String summary = cartItems.stream()
                .map(item -> "- " + item.getProductName() + " (Qty: " + item.getQuantity() + ") - ₹" + (item.getPrice() * item.getQuantity()))
                .collect(Collectors.joining("\n"));
        return new AIResponse("Here are the items in your cart:\n\n" + summary + "\n\n**Total Amount: ₹" + total + "**", "NAVIGATE_CART", null);
    }

    private AIResponse handleTrackOrder(int userId) {
        List<Order> orders = orderDAO.findByUserId(userId);
        if (orders.isEmpty()) {
            return new AIResponse("You haven't placed any orders yet.", "NAVIGATE_ORDERS", null);
        }
        Order lastOrder = orders.get(0);
        OrderTrackingResponse tracking = orderDAO.findTrackingById(lastOrder.getId());
        String status = tracking != null ? tracking.getTrackingStatus() : lastOrder.getStatus();
        String readableStatus = formatStatus(status);
        
        return new AIResponse("Your last order (ID: #" + lastOrder.getId() + ") status is **" + readableStatus + "**. Estimated delivery: " + 
                (lastOrder.getEstimatedDeliveryTime() != null ? lastOrder.getEstimatedDeliveryTime().toString().replace("T", " ") : "45 mins"),
                "NAVIGATE_TRACK_ORDER", lastOrder.getId());
    }

    private AIResponse handleBookService(String query) {
        String match = query.toLowerCase();
        HomeServiceProvider provider = MOCK_HOME_SERVICES.stream()
                .filter(p -> p.getServiceType().contains(match) || match.contains(p.getServiceType()))
                .findFirst()
                .orElse(MOCK_HOME_SERVICES.get(0));

        String reply = "We have booked an appointment for you with our top-rated local expert:\n\n" +
                "- **Name**: " + provider.getName() + "\n" +
                "- **Service**: " + capitalize(provider.getServiceType()) + "\n" +
                "- **Rating**: ⭐ " + provider.getRating() + "\n" +
                "- **Estimated Charge**: ₹" + provider.getPricePerHour() + "/hr\n" +
                "- **Contact**: " + provider.getPhone() + "\n\n" +
                "Our partner will contact you shortly to coordinate arrival. I will also add this booking to your services.";

        // Insert into database-driven cart
        try {
            addMockProductToCart(1, "HOME_SERVICE", provider.getServiceType().hashCode(), 1, 
                    capitalize(provider.getServiceType()) + " Booking", provider.getPricePerHour(), 
                    "https://cdn-icons-png.flaticon.com/512/2933/2933405.png", provider.getName());
        } catch (Exception e) {
            System.err.println("Could not add Home Service to cart DB: " + e.getMessage());
        }

        return new AIResponse(reply, "NAVIGATE_CART", null);
    }

    private AIResponse handleAgricultureQuery(String query) {
        if (query == null || query.isEmpty()) {
            String list = MOCK_AGRI_PRODUCTS.stream()
                    .map(p -> "- " + p.getName() + " (" + p.getCategory() + ") - ₹" + p.getPrice())
                    .collect(Collectors.joining("\n"));
            return new AIResponse("Here are some available agricultural products:\n\n" + list + "\n\nYou can ask me to add any of these to your cart.");
        }

        String match = query.toLowerCase();
        List<AgriProduct> filtered = MOCK_AGRI_PRODUCTS.stream()
                .filter(p -> p.getName().toLowerCase().contains(match) || p.getCategory().toLowerCase().contains(match))
                .collect(Collectors.toList());

        if (filtered.isEmpty()) {
            return new AIResponse("We couldn't find any agricultural products matching '" + query + "'. We offer hybrid seeds, vermicompost, and farming tools. Here are the items:\n\n" +
                    MOCK_AGRI_PRODUCTS.stream().map(p -> "- " + p.getName() + " - ₹" + p.getPrice()).collect(Collectors.joining("\n")));
        }

        String list = filtered.stream()
                .map(p -> "- **" + p.getName() + "** (" + p.getCategory() + ")\n  *Price*: ₹" + p.getPrice() + "\n  *Description*: " + p.getDescription())
                .collect(Collectors.joining("\n\n"));

        return new AIResponse("Here are the matching agricultural products:\n\n" + list);
    }

    private AIResponse handleHospitalQuery(String district) {
        String hospital = GOVT_HOSPITALS.get(district.toLowerCase());
        if (hospital == null) {
            hospital = "Government Headquarters General Hospital, located in your nearest district headquarter town.";
        }
        return new AIResponse("The nearest government hospital for your district (" + capitalize(district) + ") is:\n\n📍 **" + hospital + "**\n\nIt is open 24/7 and offers emergency and general medical care.");
    }

    private AIResponse handleAddToCart(int userId, String district, String itemQuery, int quantity) {
        String q = itemQuery.toLowerCase().trim();

        // 1. Check Mock Agri products first
        for (AgriProduct p : MOCK_AGRI_PRODUCTS) {
            if (p.getName().toLowerCase().contains(q) || q.contains(p.getName().toLowerCase())) {
                addMockProductToCart(userId, "AGRICULTURE", p.getId(), quantity, p.getName(), p.getPrice(), p.getImageUrl(), "Anywhere Agro Farm");
                return new AIResponse("Added **" + quantity + "x " + p.getName() + "** to your cart!", "NAVIGATE_CART", null);
            }
        }

        // 2. Check Food products
        List<FoodProduct> foods = foodProductDAO.getFoodProducts(district);
        for (FoodProduct f : foods) {
            if (f.getName().toLowerCase().contains(q) || q.contains(f.getName().toLowerCase())) {
                addMockProductToCart(userId, "FOOD", f.getId(), quantity, f.getName(), f.getPrice(), f.getImageUrl(), f.getRestaurantName());
                return new AIResponse("Added **" + quantity + "x " + f.getName() + "** (from " + f.getRestaurantName() + ") to your cart!", "NAVIGATE_CART", null);
            }
        }

        // 3. Check Grocery products
        List<GroceryProduct> groceries = groceryProductDAO.getGroceryProducts(district, null);
        for (GroceryProduct g : groceries) {
            if (g.getName().toLowerCase().contains(q) || q.contains(g.getName().toLowerCase())) {
                addMockProductToCart(userId, "GROCERY", g.getId(), quantity, g.getName(), g.getPrice(), g.getImageUrl(), g.getStoreName());
                return new AIResponse("Added **" + quantity + "x " + g.getName() + "** (from " + g.getStoreName() + ") to your cart!", "NAVIGATE_CART", null);
            }
        }

        // 4. Check Medicine products
        List<MedicineProduct> medicines = medicineProductDAO.getMedicineProducts(district, null);
        for (MedicineProduct m : medicines) {
            if (m.getName().toLowerCase().contains(q) || q.contains(m.getName().toLowerCase())) {
                addMockProductToCart(userId, "MEDICINE", m.getId(), quantity, m.getName(), m.getPrice(), m.getImageUrl(), m.getPharmacyName());
                return new AIResponse("Added **" + quantity + "x " + m.getName() + "** (from " + m.getPharmacyName() + ") to your cart!", "NAVIGATE_CART", null);
            }
        }

        return new AIResponse("Sorry, I couldn't find any product matching '" + itemQuery + "' in your district (" + capitalize(district) + ") to add to the cart.");
    }

    private AIResponse handleFoodQuery(String district, String query, double priceLimit, String fullMsg) {
        List<FoodProduct> products = foodProductDAO.getFoodProducts(district);
        
        // vegetarian / non-vegetarian filters
        boolean isVeg = fullMsg.contains("veg") && !fullMsg.contains("non-veg") && !fullMsg.contains("non veg");
        boolean isNonVeg = fullMsg.contains("non-veg") || fullMsg.contains("non veg");
        boolean recommendCheap = fullMsg.contains("cheap") || fullMsg.contains("affordable") || fullMsg.contains("under") || priceLimit > 0;

        List<FoodProduct> filtered = products.stream()
                .filter(p -> {
                    if (query != null && !query.isEmpty() && !p.getName().toLowerCase().contains(query.toLowerCase()) && !p.getCategory().toLowerCase().contains(query.toLowerCase())) {
                        return false;
                    }
                    if (isVeg && !"VEG".equalsIgnoreCase(p.getFoodType())) {
                        return false;
                    }
                    if (isNonVeg && !"NON-VEG".equalsIgnoreCase(p.getFoodType())) {
                        return false;
                    }
                    if (priceLimit > 0 && p.getPrice() > priceLimit) {
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());

        if (recommendCheap) {
            filtered.sort(Comparator.comparingDouble(FoodProduct::getPrice));
        }

        if (filtered.isEmpty()) {
            return new AIResponse("No food items found matching your filters in " + capitalize(district) + ". Try a different query!");
        }

        List<FoodProduct> limitList = filtered.stream().limit(5).collect(Collectors.toList());
        String foodList = limitList.stream()
                .map(p -> "- **" + p.getName() + "** - ₹" + p.getPrice() + " [" + p.getFoodType() + "] (" + p.getRestaurantName() + " - ⭐ " + p.getRating() + ")")
                .collect(Collectors.joining("\n"));

        return new AIResponse("Here are the top food items available in " + capitalize(district) + ":\n\n" + foodList + "\n\nYou can ask me to add any of these to your cart!", "NAVIGATE_FOOD", null);
    }

    private AIResponse handleGroceryQuery(String district, String query, double priceLimit, String fullMsg) {
        List<GroceryProduct> products = groceryProductDAO.getGroceryProducts(district, null);
        boolean recommendCheap = fullMsg.contains("cheap") || fullMsg.contains("affordable") || fullMsg.contains("under") || priceLimit > 0;
        boolean hasOffers = fullMsg.contains("offer") || fullMsg.contains("discount");

        List<GroceryProduct> filtered = products.stream()
                .filter(p -> {
                    if (query != null && !query.isEmpty() && !p.getName().toLowerCase().contains(query.toLowerCase()) && !p.getCategory().toLowerCase().contains(query.toLowerCase())) {
                        return false;
                    }
                    if (priceLimit > 0 && p.getPrice() > priceLimit) {
                        return false;
                    }
                    if (hasOffers && (p.getOfferTag() == null || p.getOfferTag().isEmpty())) {
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());

        if (recommendCheap) {
            filtered.sort(Comparator.comparingDouble(GroceryProduct::getPrice));
        }

        if (filtered.isEmpty()) {
            return new AIResponse("No grocery products match your query in " + capitalize(district) + ".");
        }

        List<GroceryProduct> limitList = filtered.stream().limit(5).collect(Collectors.toList());
        String list = limitList.stream()
                .map(p -> "- **" + p.getName() + "** - ₹" + p.getPrice() + " / " + p.getUnitType() + " (" + p.getStoreName() + ")" + 
                        (p.getOfferTag() != null && !p.getOfferTag().isEmpty() ? " *[" + p.getOfferTag() + "]*" : ""))
                .collect(Collectors.joining("\n"));

        return new AIResponse("Here are grocery products in " + capitalize(district) + ":\n\n" + list + "\n\nWould you like me to add any of these to your cart?", "NAVIGATE_GROCERY", null);
    }

    private AIResponse handleMedicineQuery(String district, String query, double priceLimit, String fullMsg) {
        if ("pharmacy".equalsIgnoreCase(query) || fullMsg.contains("pharmacy") || fullMsg.contains("medical shop")) {
            List<Pharmacy> pharmacies = pharmacyDAO.getPharmacies(district);
            if (pharmacies.isEmpty()) {
                return new AIResponse("I couldn't find any nearby pharmacies in " + capitalize(district) + ".");
            }
            String list = pharmacies.stream()
                    .map(p -> "- **" + p.getName() + "** - " + p.getLocation() + " (⭐ " + p.getRating() + ")")
                    .collect(Collectors.joining("\n"));
            return new AIResponse("Here are some nearby pharmacies in " + capitalize(district) + ":\n\n" + list, "NAVIGATE_MEDICINE", null);
        }

        List<MedicineProduct> products = medicineProductDAO.getMedicineProducts(district, null);
        boolean recommendCheap = fullMsg.contains("cheap") || fullMsg.contains("affordable") || fullMsg.contains("under") || priceLimit > 0;

        List<MedicineProduct> filtered = products.stream()
                .filter(p -> {
                    if (query != null && !query.isEmpty() && !p.getName().toLowerCase().contains(query.toLowerCase()) && !p.getCategory().toLowerCase().contains(query.toLowerCase())) {
                        return false;
                    }
                    if (priceLimit > 0 && p.getPrice() > priceLimit) {
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());

        if (recommendCheap) {
            filtered.sort(Comparator.comparingDouble(MedicineProduct::getPrice));
        }

        if (filtered.isEmpty()) {
            return new AIResponse("No medicines found matching your query in " + capitalize(district) + ".");
        }

        List<MedicineProduct> limitList = filtered.stream().limit(5).collect(Collectors.toList());
        String list = limitList.stream()
                .map(p -> "- **" + p.getName() + "** (" + p.getDosage() + ") - ₹" + p.getPrice() + " (Pharmacy: " + p.getPharmacyName() + ")")
                .collect(Collectors.joining("\n"));

        return new AIResponse("Here are the available medicines in " + capitalize(district) + ":\n\n" + list, "NAVIGATE_MEDICINE", null);
    }

    private void addMockProductToCart(int userId, String serviceType, int productId, int quantity, 
                                     String productName, double price, String imageUrl, String providerName) {
        String checkSql = "SELECT id, quantity FROM cart WHERE user_id = ? AND service_type = ? AND product_id = ?";
        List<Map<String, Object>> existing = jdbcTemplate.queryForList(checkSql, userId, serviceType, productId);
        if (!existing.isEmpty()) {
            int id = (int) existing.get(0).get("id");
            int currentQty = (int) existing.get(0).get("quantity");
            jdbcTemplate.update("UPDATE cart SET quantity = ? WHERE id = ?", currentQty + quantity, id);
        } else {
            String insertSql = """
                INSERT INTO cart 
                (user_id, service_type, product_id, quantity, product_name, price, rating, image_url, provider_name)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
            jdbcTemplate.update(insertSql, userId, serviceType, productId, quantity, productName, price, 4.5, imageUrl, providerName);
        }
    }

    // Call local Ollama Llama 3 API for Intent Classification
    private String callOllamaClassifier(String message) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String systemPrompt = """
                You are the Anywhere app's AI assistant intent classifier.
                Given the user's message, classify it into one of these intents:
                - FOOD_SEARCH (e.g. food recommendations, search restaurants, vegetarian/non-vegetarian, cheapest food, restaurants by district)
                - GROCERY_SEARCH (e.g. search grocery, show grocery offers, cheapest grocery, recommendations)
                - MEDICINE_SEARCH (e.g. search medicines, nearby pharmacies, check availability, medicines under price)
                - ADD_TO_CART (e.g. add an item to the cart)
                - VIEW_CART (e.g. show cart items, total amount)
                - CLEAR_CART (e.g. clear my cart)
                - TRACK_ORDER (e.g. track my order, show last order)
                - ORDER_HISTORY (e.g. show order history)
                - CANCEL_ORDER (e.g. cancel order)
                - PROFILE_VIEW (e.g. show profile, saved addresses)
                - BOOK_SERVICE (e.g. book plumber, book electrician, cleaning services)
                - AGRICULTURE (e.g. seeds, fertilizers, farming tools, nearby agriculture shops)
                - RURAL_HOSPITAL (e.g. nearest government hospital)
                - RURAL_DELIVERY (e.g. delivery availability in villages)
                - GENERAL_QUERY (fallback general question)
                
                Respond strictly in JSON format matching this schema:
                {
                  "intent": "INTENT_NAME",
                  "query": "extracted search query or item name or plumber/electrician",
                  "price": double or null,
                  "quantity": int,
                  "serviceType": "FOOD"/"GROCERY"/"MEDICINE"/"AGRICULTURE" or null
                }
                Do not output any explanation, markdown formatting, or text outside the JSON block.
                """;

            String jsonPayload = """
                {
                  "model": "llama3",
                  "messages": [
                    {"role": "system", "content": "%s"},
                    {"role": "user", "content": "%s"}
                  ],
                  "stream": false,
                  "options": {
                    "temperature": 0.0
                  }
                }
                """.formatted(escapeJson(systemPrompt), escapeJson(message));

            HttpEntity<String> entity = new HttpEntity<>(jsonPayload, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(OLLAMA_URL, entity, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map body = response.getBody();
                Map messageObj = (Map) body.get("message");
                if (messageObj != null) {
                    String content = (String) messageObj.get("content");
                    return cleanJsonMarkdown(content);
                }
            }
        } catch (Exception e) {
            System.err.println("Ollama classification failed: " + e.getMessage());
        }
        return null;
    }

    // Call local Ollama Llama 3 API for General Chat
    private String callOllamaGeneralChat(String message) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String systemPrompt = "You are the AI Assistant for the Anywhere Multi-Service Delivery App. " +
                    "Be extremely polite, helpful, and concise. Your goal is to guide users to use the app's services: " +
                    "Food delivery, grocery shopping, ordering medicines, courier booking, home services (plumber, electrician, cleaning), " +
                    "and rural agriculture services (seeds, fertilizers, tools, local hospital info). Feel free to answer general queries briefly, " +
                    "but always relate back to how Anywhere can assist them.";

            String jsonPayload = """
                {
                  "model": "llama3",
                  "messages": [
                    {"role": "system", "content": "%s"},
                    {"role": "user", "content": "%s"}
                  ],
                  "stream": false,
                  "options": {
                    "temperature": 0.5
                  }
                }
                """.formatted(escapeJson(systemPrompt), escapeJson(message));

            HttpEntity<String> entity = new HttpEntity<>(jsonPayload, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(OLLAMA_URL, entity, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map body = response.getBody();
                Map messageObj = (Map) body.get("message");
                if (messageObj != null) {
                    return (String) messageObj.get("content");
                }
            }
        } catch (Exception e) {
            System.err.println("Ollama general chat failed: " + e.getMessage());
        }
        return null;
    }

    // String utilities

    private String getJsonField(String json, String fieldName) {
        Pattern pattern = Pattern.compile("\"" + fieldName + "\"\\s*:\\s*(?:\"([^\"]*)\"|([\\d\\.]+)|(null|true|false))");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            if (matcher.group(1) != null) return matcher.group(1);
            if (matcher.group(2) != null) return matcher.group(2);
            if (matcher.group(3) != null) return matcher.group(3);
        }
        return null;
    }

    private String cleanJsonMarkdown(String content) {
        String cleaned = content.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private String capitalize(String input) {
        if (input == null || input.isEmpty()) return "";
        return input.substring(0, 1).toUpperCase() + input.substring(1).toLowerCase();
    }

    private String formatStatus(String status) {
        if (status == null) return "Unknown";
        return Arrays.stream(status.split("_"))
                .map(this::capitalize)
                .collect(Collectors.joining(" "));
    }

    // Static structures for DTOs

    public static class AgriProduct {
        private final int id;
        private final String name;
        private final String category;
        private final double price;
        private final String description;
        private final String offerTag;
        private final String imageUrl;

        public AgriProduct(int id, String name, String category, double price, String description, String offerTag, String imageUrl) {
            this.id = id;
            this.name = name;
            this.category = category;
            this.price = price;
            this.description = description;
            this.offerTag = offerTag;
            this.imageUrl = imageUrl;
        }

        public int getId() { return id; }
        public String getName() { return name; }
        public String getCategory() { return category; }
        public double getPrice() { return price; }
        public String getDescription() { return description; }
        public String getOfferTag() { return offerTag; }
        public String getImageUrl() { return imageUrl; }
    }

    public static class HomeServiceProvider {
        private final String name;
        private final String serviceType;
        private final String phone;
        private final double rating;
        private final double pricePerHour;

        public HomeServiceProvider(String name, String serviceType, String phone, double rating, double pricePerHour) {
            this.name = name;
            this.serviceType = serviceType;
            this.phone = phone;
            this.rating = rating;
            this.pricePerHour = pricePerHour;
        }

        public String getName() { return name; }
        public String getServiceType() { return serviceType; }
        public String getPhone() { return phone; }
        public double getRating() { return rating; }
        public double getPricePerHour() { return pricePerHour; }
    }
}
