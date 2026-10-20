package com.app.start_app.rag;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Service to call Ollama embed endpoint with nomic-embed-text model.
 */
@Service
public class OllamaEmbedService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String embedUrl;
    private final String embedModel;

    public OllamaEmbedService(
            @Value("${ollama.embed.url:http://localhost:11434/api/embed}") String embedUrl,
            @Value("${ollama.embed.model:nomic-embed-text}") String embedModel) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.embedUrl = embedUrl;
        this.embedModel = embedModel;
    }

    public List<Float> embed(String text) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> payload = Map.of(
                    "model", embedModel,
                    "input", text == null ? "" : text
            );

            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(payload), headers);
            EmbedResponse response = restTemplate.postForObject(embedUrl, entity, EmbedResponse.class);

            if (response == null || response.embeddings == null || response.embeddings.isEmpty()) {
                throw new IllegalStateException("Ollama embed returned empty embeddings.");
            }

            return response.embeddings.get(0);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate embedding from Ollama: " + e.getMessage(), e);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class EmbedResponse {
        public List<List<Float>> embeddings;
    }
}
