package com.app.start_app.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/** Small REST client for the locally running Ollama model. */
@Service
public class OllamaClientService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String endpoint;
    private final String model;

    public OllamaClientService(
            @Value("${ollama.api.url:http://localhost:11434/api/generate}") String endpoint,
            @Value("${ollama.model:llama3.2}") String model) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.endpoint = endpoint;
        this.model = model;
    }

    public String generate(String fullPrompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, Object> payload = Map.of(
                    "model", model,
                    "prompt", fullPrompt == null ? "" : fullPrompt,
                    "stream", false
            );

            Response response = restTemplate.postForObject(
                    endpoint,
                    new HttpEntity<>(objectMapper.writeValueAsString(payload), headers),
                    Response.class
            );
            if (response == null || response.response == null || response.response.isBlank()) {
                throw new IllegalStateException("Ollama returned an empty response.");
            }
            return response.response.trim();
        } catch (Exception exception) {
            if (isConnectionFailure(exception)) {
                throw new IllegalStateException(
                        "AI service is starting. Please retry shortly.", exception);
            }
            throw new IllegalStateException("Ollama request failed: " + exception.getMessage(), exception);
        }
    }

    public String generateWithSystem(String systemPrompt, String userPrompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, Object> payload = Map.of(
                    "model", model,
                    "system", systemPrompt == null ? "" : systemPrompt,
                    "prompt", userPrompt == null ? "" : userPrompt,
                    "stream", false
            );

            Response response = restTemplate.postForObject(
                    endpoint,
                    new HttpEntity<>(objectMapper.writeValueAsString(payload), headers),
                    Response.class
            );
            if (response == null || response.response == null || response.response.isBlank()) {
                throw new IllegalStateException("Ollama returned an empty response.");
            }
            return response.response.trim();
        } catch (Exception exception) {
            if (isConnectionFailure(exception)) {
                throw new IllegalStateException(
                        "AI service is starting. Please retry shortly.", exception);
            }
            throw new IllegalStateException("Ollama request failed: " + exception.getMessage(), exception);
        }
    }

    private boolean isConnectionFailure(Exception exception) {
        Throwable current = exception;
        while (current != null) {
            String name = current.getClass().getName();
            if (name.contains("ConnectException") || name.contains("ResourceAccessException")) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    /** Jackson can bind Ollama's response without exposing the transport details. */
    private static class Response {
        public String response;
    }
}
