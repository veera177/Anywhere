package com.app.start_app.rag;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientResponseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

/**
 * REST client for ChromaDB's v2 API.
 */
@Service
public class ChromaRestClient {

    private static final Logger log = LoggerFactory.getLogger(ChromaRestClient.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String chromaUrl;
    private final String defaultTenant = "default_tenant";
    private final String defaultDatabase = "default_database";

    public ChromaRestClient(@Value("${chroma.url:http://localhost:8000}") String chromaUrl) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.chromaUrl = chromaUrl.replaceAll("/+$", "");
    }

    public boolean isHealthy() {
        try {
            restTemplate.getForObject(v2("/heartbeat"), String.class);
            return true;
        } catch (Exception e) {
            log.error("Chroma v2 heartbeat failed at {}: {}", v2("/heartbeat"), describe(e), e);
            return false;
        }
    }

    public String getOrCreateCollection(String name) {
        try {
            String getUrl = collectionUrl(name);
            try {
                String response = restTemplate.getForObject(getUrl, String.class);
                JsonNode node = objectMapper.readTree(response);
                if (node.has("id")) {
                    return node.get("id").asText();
                }
            } catch (Exception notFoundOrError) {
                // Not found, create it
            }

            String createUrl = collectionsUrl();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, Object> body = Map.of("name", name);
            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(body), headers);
            String response = restTemplate.postForObject(createUrl, entity, String.class);
            JsonNode node = objectMapper.readTree(response);
            if (node.has("id")) {
                return node.get("id").asText();
            }
        } catch (Exception e) {
            log.error("Chroma v2 get/create collection '{}' failed: {}", name, describe(e), e);
            throw new IllegalStateException("Failed to get/create Chroma v2 collection '" + name + "': " + describe(e), e);
        }
        throw new IllegalStateException("Collection ID could not be determined for: " + name);
    }

    public int count(String collectionId) {
        String url = collectionUrl(collectionId) + "/count";
        try {
            String response = restTemplate.getForObject(url, String.class);
            return Integer.parseInt(response.trim());
        } catch (Exception e) {
            log.error("Chroma v2 count failed at {}: {}", url, describe(e), e);
            throw new IllegalStateException("Failed to count Chroma v2 collection: " + describe(e), e);
        }
    }

    public void add(String collectionId, List<String> ids, List<List<Float>> embeddings,
                    List<String> documents, List<Map<String, Object>> metadatas) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("ids", ids);
        payload.put("embeddings", embeddings);
        payload.put("documents", documents);
        payload.put("metadatas", metadatas);

        String url = collectionUrl(collectionId) + "/upsert";
        try {
            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(payload), headers);
            restTemplate.postForObject(url, entity, String.class);
        } catch (Exception e) {
            log.error("Chroma v2 upsert failed at {}: {}", url, describe(e), e);
            throw new IllegalStateException("Failed to upsert Chroma v2 documents: " + describe(e), e);
        }
    }

    /**
     * Reads metadata for one deterministic FAQ id.  This lets ingestion detect a
     * changed source file without deleting a collection or adding duplicate rows.
     */
    public Map<String, Object> getMetadata(String collectionId, String id) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("ids", List.of(id));
        payload.put("include", List.of("metadatas"));
        String url = collectionUrl(collectionId) + "/get";
        try {
            String response = restTemplate.postForObject(url,
                    new HttpEntity<>(objectMapper.writeValueAsString(payload), headers), String.class);
            JsonNode metadatas = objectMapper.readTree(response).path("metadatas");
            if (!metadatas.isArray() || metadatas.isEmpty() || !metadatas.get(0).isObject()) {
                return Collections.emptyMap();
            }
            return objectMapper.convertValue(metadatas.get(0), Map.class);
        } catch (Exception e) {
            log.warn("Chroma metadata lookup failed at {}: {}", url, describe(e));
            return Collections.emptyMap();
        }
    }

    public QueryResult query(String collectionId, List<Float> queryEmbedding, int nResults) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("query_embeddings", List.of(queryEmbedding));
        payload.put("n_results", nResults);
        payload.put("include", List.of("documents", "distances", "metadatas"));

        String url = collectionUrl(collectionId) + "/query";
        try {
            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(payload), headers);
            String response = restTemplate.postForObject(url, entity, String.class);
            return objectMapper.readValue(response, QueryResult.class);
        } catch (Exception e) {
            log.error("Chroma v2 query failed at {}: {}", url, describe(e), e);
            throw new IllegalStateException("Failed to query Chroma v2 collection: " + describe(e), e);
        }
    }

    private String v2(String path) {
        return chromaUrl + "/api/v2" + path;
    }

    private String collectionsUrl() {
        return v2("/tenants/" + defaultTenant + "/databases/" + defaultDatabase + "/collections");
    }

    private String collectionUrl(String collectionIdOrName) {
        return collectionsUrl() + "/" + collectionIdOrName;
    }

    private String describe(Exception e) {
        if (e instanceof RestClientResponseException responseException) {
            return "HTTP " + responseException.getStatusCode() + " body=" + responseException.getResponseBodyAsString();
        }
        return e.getMessage();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class QueryResult {
        public List<List<String>> ids;
        public List<List<Double>> distances;
        public List<List<String>> documents;
        public List<List<Map<String, Object>>> metadatas;
    }
}
