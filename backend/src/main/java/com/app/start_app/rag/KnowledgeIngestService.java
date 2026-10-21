package com.app.start_app.rag;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Indexes bundled customer knowledge into the existing Chroma collection. */
@Service
public class KnowledgeIngestService {
    private static final Logger log = LoggerFactory.getLogger(KnowledgeIngestService.class);
    private static final List<String> KNOWLEDGE_FILES = List.of(
            "faq.md", "anywhere-overview.md", "food-delivery.md", "grocery-delivery.md", "medicine-delivery.md",
            "courier-service.md", "districts-and-availability.md", "account-and-profile.md", "cart-and-checkout.md",
            "payments-and-refunds.md", "orders-and-tracking.md", "delivery-fees.md", "customer-faq.md",
            "customer-support-behavior.md");

    private final ChromaRestClient chromaClient;
    private final OllamaEmbedService embedService;
    private final ResourceLoader resourceLoader;
    private final String collectionName;

    public KnowledgeIngestService(ChromaRestClient chromaClient, OllamaEmbedService embedService,
                                  ResourceLoader resourceLoader,
                                  @Value("${chroma.collection:anywhere_knowledge}") String collectionName) {
        this.chromaClient = chromaClient;
        this.embedService = embedService;
        this.resourceLoader = resourceLoader;
        this.collectionName = collectionName;
    }

    @PostConstruct
    public void init() {
        try {
            if (!chromaClient.isHealthy()) {
                log.warn("Chroma is not reachable during startup knowledge ingestion check.");
                return;
            }
            log.info("Knowledge startup check completed; {} changed chunks indexed in '{}'.", ingestAll(), collectionName);
        } catch (Exception exception) {
            log.warn("Knowledge initial ingestion skipped/failed: {}", exception.getMessage());
        }
    }

    /** Reindexes only changed source documents. IDs are stable and Chroma uses upsert, never blind deletion. */
    public synchronized int ingestAll() {
        String collectionId = chromaClient.getOrCreateCollection(collectionName);
        int indexed = 0;
        for (KnowledgeDocument document : loadDocuments()) {
            if (document.chunks().isEmpty()) continue;
            String indexedHash = String.valueOf(chromaClient.getMetadata(collectionId, document.chunks().get(0).id())
                    .getOrDefault("source_hash", ""));
            if (document.sourceHash().equals(indexedHash)) {
                log.debug("Knowledge source '{}' is unchanged; skipping embeddings.", document.sourceFile());
                continue;
            }
            indexDocument(collectionId, document);
            indexed += document.chunks().size();
        }
        return indexed;
    }

    private void indexDocument(String collectionId, KnowledgeDocument document) {
        List<String> ids = new ArrayList<>();
        List<List<Float>> embeddings = new ArrayList<>();
        List<String> texts = new ArrayList<>();
        List<Map<String, Object>> metadata = new ArrayList<>();
        for (KnowledgeChunk chunk : document.chunks()) {
            ids.add(chunk.id());
            embeddings.add(embedService.embed(chunk.text()));
            texts.add(chunk.text());
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("document_id", chunk.id());
            entry.put("title", chunk.title());
            entry.put("source", chunk.title());
            entry.put("source_file", document.sourceFile());
            entry.put("category", chunk.category());
            entry.put("chunk_text", chunk.text());
            entry.put("source_hash", document.sourceHash());
            metadata.add(entry);
        }
        chromaClient.add(collectionId, ids, embeddings, texts, metadata);
        log.info("Indexed {} customer-knowledge chunks from '{}'.", ids.size(), document.sourceFile());
    }

    private List<KnowledgeDocument> loadDocuments() {
        List<KnowledgeDocument> documents = new ArrayList<>();
        for (String file : KNOWLEDGE_FILES) {
            String text = readKnowledgeFile(file);
            if (text == null || text.isBlank()) continue;
            List<KnowledgeChunk> chunks = "faq.md".equals(file) ? parseLegacyFaq(text) : parseMarkdown(file, text);
            documents.add(new KnowledgeDocument(file, sha256(text), chunks));
        }
        return documents;
    }

    private String readKnowledgeFile(String file) {
        try {
            Resource resource = resourceLoader.getResource("classpath:knowledge/" + file);
            if (!resource.exists()) {
                if (!"customer-support-behavior.md".equals(file)) log.warn("Knowledge source '{}' was not found.", file);
                return null;
            }
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) output.append(line).append('\n');
            }
            return output.toString();
        } catch (Exception exception) {
            log.warn("Could not read knowledge source '{}': {}", file, exception.getMessage());
            return null;
        }
    }

    /** Preserves the pre-existing faq-1...faq-N IDs. */
    private List<KnowledgeChunk> parseLegacyFaq(String content) {
        List<KnowledgeChunk> chunks = new ArrayList<>();
        int index = 1;
        for (String entry : content.split("(?m)^## ")) {
            String trimmed = entry.trim();
            if (trimmed.isEmpty()) continue;
            String[] lines = trimmed.split("\\n", 2);
            String title = lines[0].trim();
            String body = lines.length > 1 ? lines[1].trim() : "";
            chunks.add(new KnowledgeChunk("faq-" + index++, title,
                    capture(body, "(?m)^Category:\\s*(.+)$", "GENERAL"), "## " + title + "\n" + body));
        }
        return chunks;
    }

    /** Meaningful authored H2 sections are chunks; no rule is split mid-paragraph. */
    private List<KnowledgeChunk> parseMarkdown(String file, String content) {
        String documentTitle = capture(content, "(?m)^#\\s+(.+)$", file);
        List<KnowledgeChunk> chunks = new ArrayList<>();
        int index = 0;
        for (String section : content.split("(?m)^## ")) {
            String trimmed = section.trim();
            if (trimmed.isBlank()) continue;
            String[] lines = trimmed.split("\\n", 2);
            String title = trimmed.startsWith("# ") ? documentTitle : documentTitle + " — " + lines[0].trim();
            String text = trimmed.startsWith("# ") ? trimmed : "# " + documentTitle + "\n## " + trimmed;
            chunks.add(new KnowledgeChunk("kb-" + slug(file) + "-" + (++index), title, categoryFor(file), text));
        }
        return chunks;
    }

    private String capture(String text, String expression, String fallback) {
        Matcher matcher = Pattern.compile(expression).matcher(text);
        return matcher.find() ? matcher.group(1).trim() : fallback;
    }
    private String categoryFor(String file) {
        if (file.contains("food")) return "FOOD";
        if (file.contains("grocery")) return "GROCERY";
        if (file.contains("medicine")) return "MEDICINE";
        if (file.contains("courier")) return "COURIER";
        if (file.contains("payment") || file.contains("fee")) return "PAYMENTS";
        if (file.contains("order")) return "ORDERS";
        if (file.contains("account") || file.contains("profile")) return "ACCOUNT";
        return "GENERAL";
    }
    private String sha256(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch (Exception exception) { throw new IllegalStateException("Unable to fingerprint knowledge source", exception); }
    }
    private String slug(String value) { return value.replaceAll("\\.md$", "").replaceAll("[^a-zA-Z0-9]+", "-").replaceAll("(^-|-$)", "").toLowerCase(Locale.ROOT); }

    public record KnowledgeDocument(String sourceFile, String sourceHash, List<KnowledgeChunk> chunks) {}
    public record KnowledgeChunk(String id, String title, String category, String text) {}
    public record FaqChunk(String title, String question, String answer, String category, String fullText) {}
}
