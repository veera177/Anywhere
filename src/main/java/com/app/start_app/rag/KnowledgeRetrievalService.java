package com.app.start_app.rag;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

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
            result = chromaClient.query(colId, queryEmbedding, topN);
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

            log.info("RAG candidate: id={}, distance={}, title='{}', threshold={}, accepted={}",
                    id, distance, source, distanceThreshold, distance <= distanceThreshold);

            if (distance <= distanceThreshold) {
                matchingChunks.add(new RetrievedChunk(id, document, distance, source, category));
            }
        }

        return matchingChunks;
    }

    public double getDistanceThreshold() {
        return distanceThreshold;
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
