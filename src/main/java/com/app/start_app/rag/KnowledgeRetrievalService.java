package com.app.start_app.rag;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Service to embed user question and retrieve top matching knowledge chunks from Chroma.
 */
@Service
public class KnowledgeRetrievalService {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeRetrievalService.class);

    private final ChromaRestClient chromaClient;
    private final OllamaEmbedService embedService;
    private final String collectionName;
    private final double distanceThreshold;
    private static final Set<String> GENERIC_TERMS = Set.of(
            "about", "after", "before", "could", "delivery", "does", "from", "have",
            "help", "information", "order", "orders", "policy", "question", "service",
            "that", "their", "there", "these", "what", "when", "where", "which", "with",
            "would", "your", "anywhere");

    public KnowledgeRetrievalService(
            ChromaRestClient chromaClient,
            OllamaEmbedService embedService,
            @Value("${chroma.collection:anywhere_knowledge}") String collectionName,
            @Value("${rag.distance.threshold:0.45}") double distanceThreshold) {
        this.chromaClient = chromaClient;
        this.embedService = embedService;
        this.collectionName = collectionName;
        this.distanceThreshold = distanceThreshold;
    }

    public List<RetrievedChunk> retrieve(String query) {
        return retrieve(query, 3);
    }

    public List<RetrievedChunk> retrieve(String query, int topN) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }
        if (!chromaClient.isHealthy()) {
            throw new ChromaUnavailableException("ChromaDB service is unavailable");
        }

        final ChromaRestClient.QueryResult result;
        try {
            List<Float> queryEmbedding = embedService.embed(query);
            String colId = chromaClient.getOrCreateCollection(collectionName);
            // A few more candidates let the lexical safety net find an authored
            // policy section when an embedding score is just outside the strict
            // semantic threshold.
            result = chromaClient.query(colId, queryEmbedding, Math.max(topN, 8));
        } catch (Exception exception) {
            // Embedding and Chroma transport failures are both unavailable knowledge,
            // not facts the assistant may safely guess at.
            log.warn("RAG retrieval unavailable for query '{}': {}", query, exception.getMessage());
            throw new ChromaUnavailableException("Knowledge retrieval is unavailable", exception);
        }
        if (result == null || result.ids == null || result.ids.isEmpty() || result.ids.get(0).isEmpty()) {
            return Collections.emptyList();
        }

        List<RetrievedChunk> matchingChunks = new ArrayList<>();
        List<String> ids = result.ids.get(0);
        List<Double> distances = (result.distances != null && !result.distances.isEmpty()) ? result.distances.get(0) : Collections.emptyList();
        List<String> documents = (result.documents != null && !result.documents.isEmpty()) ? result.documents.get(0) : Collections.emptyList();
        List<Map<String, Object>> metadatas = (result.metadatas != null && !result.metadatas.isEmpty()) ? result.metadatas.get(0) : Collections.emptyList();

        for (int i = 0; i < ids.size(); i++) {
            String id = ids.get(i);
            double distance = i < distances.size() ? distances.get(i) : 1.0;
            String document = i < documents.size() ? documents.get(i) : "";
            Map<String, Object> meta = i < metadatas.size() ? metadatas.get(i) : Collections.emptyMap();
            String source = meta != null && meta.containsKey("source") ? String.valueOf(meta.get("source")) : id;
            String category = meta != null && meta.containsKey("category") ? String.valueOf(meta.get("category")) : "GENERAL";

            boolean semanticMatch = distance <= distanceThreshold;
            boolean keywordMatch = hasSpecificKeywordOverlap(query, document);
            boolean accepted = semanticMatch || keywordMatch;
            log.info("RAG candidate: id={}, distance={}, title='{}', threshold={}, semanticMatch={}, keywordMatch={}, accepted={}",
                    id, distance, source, distanceThreshold, semanticMatch, keywordMatch, accepted);

            if (accepted) {
                matchingChunks.add(new RetrievedChunk(id, document, distance, source, category));
            }
        }

        return matchingChunks;
    }

    public double getDistanceThreshold() {
        return distanceThreshold;
    }

    /**
     * Chroma still selects the candidate documents. This only accepts a selected
     * candidate outside the semantic cutoff when it contains a meaningful word
     * used by the customer, preventing a documented FAQ from being discarded due
     * to minor embedding-model variation.
     */
    private boolean hasSpecificKeywordOverlap(String query, String document) {
        if (query == null || document == null || document.isBlank()) return false;
        Set<String> queryTerms = significantTerms(query);
        if (queryTerms.isEmpty()) return false;
        Set<String> documentTerms = significantTerms(document);
        for (String term : queryTerms) {
            if (documentTerms.contains(term)) return true;
        }
        return false;
    }

    private Set<String> significantTerms(String value) {
        Set<String> terms = new HashSet<>();
        for (String word : value.toLowerCase(Locale.ROOT).split("[^a-z0-9]+")) {
            if (word.length() >= 5 && !GENERIC_TERMS.contains(word)) terms.add(word);
        }
        return terms;
    }

    public record RetrievedChunk(String id, String document, double distance, String source, String category) {}

    public static class ChromaUnavailableException extends RuntimeException {
        public ChromaUnavailableException(String message) {
            super(message);
        }

        public ChromaUnavailableException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
