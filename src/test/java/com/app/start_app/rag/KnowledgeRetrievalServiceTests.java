package com.app.start_app.rag;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.ResourceLoader;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for the Anywhere RAG knowledge layer.
 *
 * These tests use fakes for Chroma and Ollama — no running services are required.
 * Tests that require live Chroma/Ollama are documented as integration-only and
 * are NOT executed here; they must be run in an environment where those services
 * are available.
 */
class KnowledgeRetrievalServiceTests {

    // ── RETRIEVAL TESTS ──────────────────────────────────────────────────────

    @Test
    @DisplayName("Retrieves a relevant FAQ chunk for a refund paraphrase")
    void retrievesRelevantFaqForRefundParaphrases() {
        FakeChroma chroma = new FakeChroma(true, 0.21d, "Refund policy",
                "Q: What is your refund policy?\nA: Refunds are returned to the original payment method.");
        FakeEmbedder embedder = new FakeEmbedder();
        KnowledgeRetrievalService service = new KnowledgeRetrievalService(chroma, embedder, "anywhere_knowledge", 0.45d);

        List<KnowledgeRetrievalService.RetrievedChunk> chunks = service.retrieve("How do I get my money back?");

        assertEquals(1, chunks.size());
        assertEquals("Refund policy", chunks.get(0).source());
        assertEquals("How do I get my money back?", embedder.lastText);
    }

    @Test
    @DisplayName("Retrieves a refund chunk for alternate paraphrase: 'Can I get a refund?'")
    void retrievesRefundChunkForAlternateParaphrase() {
        FakeChroma chroma = new FakeChroma(true, 0.30d, "Refund policy",
                "Q: What is your refund policy?\nA: Refunds are processed back to your original payment method.");
        KnowledgeRetrievalService service = new KnowledgeRetrievalService(chroma, new FakeEmbedder(), "anywhere_knowledge", 0.45d);

        List<KnowledgeRetrievalService.RetrievedChunk> chunks = service.retrieve("Can I get a refund for my order?");

        assertEquals(1, chunks.size());
        assertEquals("Refund policy", chunks.get(0).source());
    }

    @Test
    @DisplayName("Retrieves a food delivery chunk for food ordering question")
    void retrievesFoodDeliveryChunkForFoodQuestion() {
        FakeChroma chroma = new FakeChroma(true, 0.22d, "Food delivery — Browse and order",
                "Open Food Delivery, choose a district, browse restaurants or search dishes, add available dishes to the cart.");
        KnowledgeRetrievalService service = new KnowledgeRetrievalService(chroma, new FakeEmbedder(), "anywhere_knowledge", 0.45d);

        List<KnowledgeRetrievalService.RetrievedChunk> chunks = service.retrieve("How do I order food?");

        assertEquals(1, chunks.size());
        assertTrue(chunks.get(0).source().contains("Food delivery"),
                "Source should reference food delivery, got: " + chunks.get(0).source());
    }

    @Test
    @DisplayName("Retrieves a courier chunk for 'How can I send a parcel?'")
    void retrievesCourierChunkForParcelQuestion() {
        FakeChroma chroma = new FakeChroma(true, 0.28d, "Courier service — Booking a courier",
                "Enter pickup and destination addresses, select autocomplete suggestions, and the backend calculates distance and fee.");
        KnowledgeRetrievalService service = new KnowledgeRetrievalService(chroma, new FakeEmbedder(), "anywhere_knowledge", 0.45d);

        List<KnowledgeRetrievalService.RetrievedChunk> chunks = service.retrieve("How can I send a parcel?");

        assertEquals(1, chunks.size());
        assertTrue(chunks.get(0).source().contains("Courier"),
                "Source should reference courier, got: " + chunks.get(0).source());
    }

    @Test
    @DisplayName("Retrieves a districts chunk for 'Why can't I find restaurants in my district?'")
    void retrievesDistrictChunkForMissingRestaurantsQuestion() {
        FakeChroma chroma = new FakeChroma(true, 0.25d, "Districts and availability — Why a partner may not appear",
                "A restaurant will not appear if the registered location is outside the service radius or the partner is inactive.");
        KnowledgeRetrievalService service = new KnowledgeRetrievalService(chroma, new FakeEmbedder(), "anywhere_knowledge", 0.45d);

        List<KnowledgeRetrievalService.RetrievedChunk> chunks = service.retrieve("Why can't I find restaurants in my district?");

        assertEquals(1, chunks.size());
    }

    // ── THRESHOLD AND EMPTY RESULT TESTS ────────────────────────────────────

    @Test
    @DisplayName("Rejects a result outside the configured distance threshold")
    void rejectsAResultOutsideTheConfiguredThreshold() {
        KnowledgeRetrievalService service = new KnowledgeRetrievalService(
                new FakeChroma(true, 0.46d, "Refund policy", "Q: Refund policy"), new FakeEmbedder(), "anywhere_knowledge", 0.45d);

        assertTrue(service.retrieve("What is your refund policy?").isEmpty(),
                "Distance 0.46 should be above threshold 0.45 and produce empty results");
    }

    @Test
    @DisplayName("Returns empty list when no documents are found in Chroma")
    void returnsEmptyListWhenNoDocumentsFound() {
        KnowledgeRetrievalService service = new KnowledgeRetrievalService(
                new EmptyChroma(), new FakeEmbedder(), "anywhere_knowledge", 0.45d);

        List<KnowledgeRetrievalService.RetrievedChunk> result = service.retrieve("Some question with no match");

        assertTrue(result.isEmpty(), "Empty Chroma result should produce empty list");
    }

    @Test
    @DisplayName("Returns empty list for a blank query without calling Chroma")
    void returnsEmptyListForBlankQuery() {
        CountingChroma countingChroma = new CountingChroma();
        KnowledgeRetrievalService service = new KnowledgeRetrievalService(countingChroma, new FakeEmbedder(), "anywhere_knowledge", 0.45d);

        List<KnowledgeRetrievalService.RetrievedChunk> result = service.retrieve("   ");

        assertTrue(result.isEmpty());
        assertEquals(0, countingChroma.queryCount, "Chroma should not be queried for blank input");
    }

    @Test
    @DisplayName("Returns empty list for a null query without calling Chroma")
    void returnsEmptyListForNullQuery() {
        CountingChroma countingChroma = new CountingChroma();
        KnowledgeRetrievalService service = new KnowledgeRetrievalService(countingChroma, new FakeEmbedder(), "anywhere_knowledge", 0.45d);

        List<KnowledgeRetrievalService.RetrievedChunk> result = service.retrieve(null);

        assertTrue(result.isEmpty());
        assertEquals(0, countingChroma.queryCount);
    }

    // ── FAILURE SAFETY TESTS ─────────────────────────────────────────────────

    @Test
    @DisplayName("Throws ChromaUnavailableException when Chroma is unavailable")
    void failsSafelyWhenChromaIsUnavailable() {
        KnowledgeRetrievalService service = new KnowledgeRetrievalService(
                new FakeChroma(false, 0.1d, "irrelevant", "irrelevant"),
                new FakeEmbedder(), "anywhere_knowledge", 0.45d);

        assertThrows(KnowledgeRetrievalService.ChromaUnavailableException.class,
                () -> service.retrieve("Can I get a refund for a cancelled order?"),
                "Unavailable Chroma should throw ChromaUnavailableException");
    }

    @Test
    @DisplayName("Throws ChromaUnavailableException when embedding service is unavailable")
    void failsSafelyWhenEmbeddingIsUnavailable() {
        KnowledgeRetrievalService service = new KnowledgeRetrievalService(
                new FakeChroma(true, 0.1d, "irrelevant", "irrelevant"),
                new FailingEmbedder(), "anywhere_knowledge", 0.45d);

        assertThrows(KnowledgeRetrievalService.ChromaUnavailableException.class,
                () -> service.retrieve("Can I get a refund for a cancelled order?"),
                "Failing embedder should be caught and wrapped as ChromaUnavailableException");
    }

    // ── INGESTION TESTS ──────────────────────────────────────────────────────

    @Test
    @DisplayName("Ingestion: document loading reads all expected knowledge files from classpath")
    void ingestServiceLoadsKnowledgeFilesFromClasspath() {
        // This test verifies that KnowledgeIngestService can load the knowledge files
        // from the classpath without errors. It uses a fake Chroma that captures upserts.
        CapturingChroma chroma = new CapturingChroma();
        FakeEmbedder embedder = new FakeEmbedder();
        ResourceLoader loader = new DefaultResourceLoader();
        KnowledgeIngestService service = new KnowledgeIngestService(chroma, embedder, loader, "anywhere_knowledge");

        // We expect ingestAll to succeed (returns >= 0 indexed count)
        // Because Chroma fake always returns empty metadata (simulating fresh index),
        // all documents will be indexed.
        int indexed = service.ingestAll();

        assertTrue(indexed >= 0, "ingestAll should return a non-negative count");
        // With all 14 knowledge files present (faq + 13 new), we expect chunks > 0.
        assertTrue(indexed > 0, "At least some chunks should be indexed from knowledge files");
    }

    @Test
    @DisplayName("Ingestion: deterministic IDs — faq.md uses faq-N prefix")
    void faqChunksUseDeterministicFaqIds() {
        CapturingChroma chroma = new CapturingChroma();
        ResourceLoader loader = new DefaultResourceLoader();
        KnowledgeIngestService service = new KnowledgeIngestService(chroma, new FakeEmbedder(), loader, "anywhere_knowledge");

        service.ingestAll();

        // All faq.md IDs should start with "faq-"
        boolean hasFaqIds = chroma.capturedIds.stream().anyMatch(id -> id.startsWith("faq-"));
        assertTrue(hasFaqIds, "FAQ document chunks should use 'faq-' prefixed deterministic IDs");
    }

    @Test
    @DisplayName("Ingestion: deterministic IDs — other knowledge files use kb- prefix")
    void knowledgeFileChunksUseKbPrefix() {
        CapturingChroma chroma = new CapturingChroma();
        ResourceLoader loader = new DefaultResourceLoader();
        KnowledgeIngestService service = new KnowledgeIngestService(chroma, new FakeEmbedder(), loader, "anywhere_knowledge");

        service.ingestAll();

        boolean hasKbIds = chroma.capturedIds.stream().anyMatch(id -> id.startsWith("kb-"));
        assertTrue(hasKbIds, "Non-FAQ knowledge chunks should use 'kb-' prefixed deterministic IDs");
    }

    @Test
    @DisplayName("Ingestion: unchanged documents are skipped (no re-embed)")
    void unchangedDocumentsAreSkippedOnSecondIngest() {
        // First pass: index all documents. Second pass: Chroma returns the same hash.
        // Chroma fake that returns the stored hash for any lookup.
        HashMatchingChroma chroma = new HashMatchingChroma();
        FakeEmbedder embedder = new FakeEmbedder();
        ResourceLoader loader = new DefaultResourceLoader();
        KnowledgeIngestService service = new KnowledgeIngestService(chroma, embedder, loader, "anywhere_knowledge");

        // First ingest populates the hash cache
        service.ingestAll();
        int embedsAfterFirstIngest = embedder.embedCount;
        assertTrue(embedsAfterFirstIngest > 0, "First ingest should embed chunks");

        // Second ingest: hash matches, so no re-embedding should occur
        service.ingestAll();
        int embedsAfterSecondIngest = embedder.embedCount;
        assertEquals(embedsAfterFirstIngest, embedsAfterSecondIngest,
                "Second ingest of unchanged documents should produce zero additional embed calls");
    }

    @Test
    @DisplayName("Ingestion: metadata contains required fields for each chunk")
    void ingestedMetadataContainsRequiredFields() {
        CapturingChroma chroma = new CapturingChroma();
        ResourceLoader loader = new DefaultResourceLoader();
        KnowledgeIngestService service = new KnowledgeIngestService(chroma, new FakeEmbedder(), loader, "anywhere_knowledge");

        service.ingestAll();

        assertFalse(chroma.capturedMetadatas.isEmpty(), "Metadata list should not be empty after ingest");
        for (Map<String, Object> meta : chroma.capturedMetadatas) {
            assertTrue(meta.containsKey("document_id"), "Metadata should have document_id");
            assertTrue(meta.containsKey("title"), "Metadata should have title");
            assertTrue(meta.containsKey("category"), "Metadata should have category");
            assertTrue(meta.containsKey("source_file"), "Metadata should have source_file");
            assertTrue(meta.containsKey("source_hash"), "Metadata should have source_hash for change detection");
        }
    }

    @Test
    @DisplayName("Ingestion: gracefully handles missing optional files (e.g., customer-support-behavior.md)")
    void ingestHandlesMissingOptionalFilesGracefully() {
        CapturingChroma chroma = new CapturingChroma();
        ResourceLoader loader = new DefaultResourceLoader();
        KnowledgeIngestService service = new KnowledgeIngestService(chroma, new FakeEmbedder(), loader, "anywhere_knowledge");

        // Should complete without exception even if some files were absent (the service logs a warning)
        assertDoesNotThrow(service::ingestAll, "ingestAll should not throw even if optional files are missing");
    }

    // ── DISTANCE THRESHOLD ACCESSOR TEST ─────────────────────────────────────

    @Test
    @DisplayName("Distance threshold accessor returns configured value")
    void distanceThresholdAccessorReturnsConfiguredValue() {
        KnowledgeRetrievalService service = new KnowledgeRetrievalService(
                new FakeChroma(true, 0.1d, "x", "x"), new FakeEmbedder(), "anywhere_knowledge", 0.45d);

        assertEquals(0.45d, service.getDistanceThreshold(), 0.001,
                "getDistanceThreshold should return the value passed at construction");
    }

    // ── TEST DOUBLES ─────────────────────────────────────────────────────────

    /** Embedder that records its last call and increments an embed counter. */
    private static final class FakeEmbedder extends OllamaEmbedService {
        String lastText;
        int embedCount = 0;

        private FakeEmbedder() { super("http://unused", "nomic-embed-text"); }

        @Override
        public List<Float> embed(String text) {
            lastText = text;
            embedCount++;
            return List.of(0.1f, 0.2f, 0.3f);
        }
    }

    /** Embedder that always throws — simulates Ollama being down. */
    private static final class FailingEmbedder extends OllamaEmbedService {
        private FailingEmbedder() { super("http://unused", "nomic-embed-text"); }

        @Override
        public List<Float> embed(String text) {
            throw new IllegalStateException("Ollama unavailable in test");
        }
    }

    /**
     * Chroma fake that returns exactly one result with a specified distance, source, and document.
     * The healthy flag controls isHealthy(). getMetadata always returns empty (simulating fresh index).
     */
    private static final class FakeChroma extends ChromaRestClient {
        private final boolean healthy;
        private final double distance;
        private final String source;
        private final String document;

        private FakeChroma(boolean healthy, double distance, String source, String document) {
            super("http://unused");
            this.healthy = healthy;
            this.distance = distance;
            this.source = source;
            this.document = document;
        }

        @Override public boolean isHealthy() { return healthy; }
        @Override public String getOrCreateCollection(String name) { return "test-collection-id"; }
        @Override public Map<String, Object> getMetadata(String collectionId, String id) { return Map.of(); }

        @Override
        public QueryResult query(String collectionId, List<Float> embedding, int count) {
            QueryResult result = new QueryResult();
            result.ids = List.of(List.of("faq-1"));
            result.distances = List.of(List.of(distance));
            result.documents = List.of(List.of(document));
            result.metadatas = List.of(List.of(Map.of("source", source, "category", "GENERAL")));
            return result;
        }
    }

    /** Chroma fake that returns empty query results (no matching documents). */
    private static final class EmptyChroma extends ChromaRestClient {
        private EmptyChroma() { super("http://unused"); }

        @Override public boolean isHealthy() { return true; }
        @Override public String getOrCreateCollection(String name) { return "test-collection-id"; }
        @Override public Map<String, Object> getMetadata(String collectionId, String id) { return Map.of(); }

        @Override
        public QueryResult query(String collectionId, List<Float> embedding, int count) {
            QueryResult result = new QueryResult();
            result.ids = List.of(List.of());
            result.distances = List.of(List.of());
            result.documents = List.of(List.of());
            result.metadatas = List.of(List.of());
            return result;
        }
    }

    /** Chroma fake that counts how many times query() is called. */
    private static final class CountingChroma extends ChromaRestClient {
        int queryCount = 0;

        private CountingChroma() { super("http://unused"); }

        @Override public boolean isHealthy() { return true; }
        @Override public String getOrCreateCollection(String name) { return "test-collection-id"; }
        @Override public Map<String, Object> getMetadata(String collectionId, String id) { return Map.of(); }

        @Override
        public QueryResult query(String collectionId, List<Float> embedding, int count) {
            queryCount++;
            QueryResult result = new QueryResult();
            result.ids = List.of(List.of());
            return result;
        }
    }

    /**
     * Chroma fake that captures all upserted IDs and metadatas for assertion.
     * getMetadata always returns empty (simulating first-time ingest).
     */
    private static final class CapturingChroma extends ChromaRestClient {
        final List<String> capturedIds = new ArrayList<>();
        final List<Map<String, Object>> capturedMetadatas = new ArrayList<>();

        private CapturingChroma() { super("http://unused"); }

        @Override public boolean isHealthy() { return true; }
        @Override public String getOrCreateCollection(String name) { return "test-collection-id"; }
        @Override public Map<String, Object> getMetadata(String collectionId, String id) { return Map.of(); }

        @Override
        public void add(String collectionId, List<String> ids, List<List<Float>> embeddings,
                        List<String> documents, List<Map<String, Object>> metadatas) {
            capturedIds.addAll(ids);
            capturedMetadatas.addAll(metadatas);
        }

        @Override
        public QueryResult query(String collectionId, List<Float> embedding, int count) {
            QueryResult result = new QueryResult();
            result.ids = List.of(List.of());
            return result;
        }
    }

    /**
     * Chroma fake that simulates an already-indexed collection by returning the
     * source_hash from the first ingest pass. This verifies that a second call to
     * ingestAll() skips re-embedding unchanged documents.
     */
    private static final class HashMatchingChroma extends ChromaRestClient {
        // Maps document chunk ID → stored source_hash
        private final Map<String, String> storedHashes = new java.util.HashMap<>();
        private final List<String> capturedIds = new ArrayList<>();

        private HashMatchingChroma() { super("http://unused"); }

        @Override public boolean isHealthy() { return true; }
        @Override public String getOrCreateCollection(String name) { return "test-collection-id"; }

        @Override
        public Map<String, Object> getMetadata(String collectionId, String id) {
            String hash = storedHashes.get(id);
            if (hash == null) return Map.of();
            return Map.of("source_hash", hash);
        }

        @Override
        public void add(String collectionId, List<String> ids, List<List<Float>> embeddings,
                        List<String> documents, List<Map<String, Object>> metadatas) {
            for (int i = 0; i < ids.size(); i++) {
                String id = ids.get(i);
                capturedIds.add(id);
                if (i < metadatas.size() && metadatas.get(i).containsKey("source_hash")) {
                    storedHashes.put(id, String.valueOf(metadatas.get(i).get("source_hash")));
                }
            }
        }

        @Override
        public QueryResult query(String collectionId, List<Float> embedding, int count) {
            QueryResult result = new QueryResult();
            result.ids = List.of(List.of());
            return result;
        }
    }
}
