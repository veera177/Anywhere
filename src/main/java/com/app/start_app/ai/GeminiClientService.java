package com.app.start_app.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Thin wrapper around the Gemini REST API.
 * Reads gemini.api.key from the environment (never hardcoded).
 */
@Service
public class GeminiClientService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=";

    private final RestTemplate restTemplate;

    public GeminiClientService() {
        this.restTemplate = new RestTemplate();
    }

    public boolean isConfigured() {
        return geminiApiKey != null && !geminiApiKey.isBlank();
    }

    /**
     * Send a prompt and return plain text. Returns null on any failure.
     */
    public String generateText(String systemContext, String userMessage, int maxOutputTokens) {
        return callGemini(systemContext, userMessage, null, maxOutputTokens, 0.7);
    }

    /**
     * Send a prompt and request a STRICT JSON response. Returns raw JSON text
     * or null on failure. Pass "application/json" as mimeType to force JSON mode.
     */
    public String generateJson(String systemContext, String userMessage, int maxOutputTokens) {
        return callGemini(systemContext, userMessage, "application/json", maxOutputTokens, 0.2);
    }

    private String callGemini(String systemContext, String userMessage, String mimeType,
                              int maxOutputTokens, double temperature) {
        if (!isConfigured()) {
            System.err.println("Gemini API key is not configured. Set GEMINI_API_KEY environment variable.");
            return null;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String mimeField = mimeType == null
                    ? ""
                    : String.format(", \"responseMimeType\": \"%s\"", mimeType);

            String payload = String.format("""
                {
                  "system_instruction": {
                    "parts": [{"text": "%s"}]
                  },
                  "contents": [
                    {
                      "role": "user",
                      "parts": [{"text": "%s"}]
                    }
                  ],
                  "generationConfig": {
                    "temperature": %s,
                    "maxOutputTokens": %s%s
                  }
                }
                """, escapeJson(systemContext), escapeJson(userMessage), temperature, maxOutputTokens, mimeField);

            HttpEntity<String> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    GEMINI_URL + geminiApiKey, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map body = response.getBody();
                List candidates = (List) body.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map candidate = (Map) candidates.get(0);
                    Map content = (Map) candidate.get("content");
                    if (content != null) {
                        List parts = (List) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            Map part = (Map) parts.get(0);
                            Object text = part.get("text");
                            if (text != null) {
                                return text.toString().trim();
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Gemini API call failed: " + e.getMessage());
        }
        return null;
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\").replace("\"", "\\\"")
                    .replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t");
    }
}