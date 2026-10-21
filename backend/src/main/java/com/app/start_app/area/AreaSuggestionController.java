package com.app.start_app.area;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/areas")
@CrossOrigin(origins = "*")
public class AreaSuggestionController {

    private static final String NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
    private static final String NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";
    private final AreaDAO areaDAO;
    private final RestTemplate restTemplate;

    public AreaSuggestionController(AreaDAO areaDAO) {
        this.areaDAO = areaDAO;

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(3000);
        this.restTemplate = new RestTemplate(factory);
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<Map<String, Object>>> getSuggestions(
            @RequestParam(required = false, defaultValue = "") String district,
            @RequestParam(required = false, defaultValue = "") String q
    ) {
        try {
            if (district == null || district.trim().isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            // 1. Local database search first
            List<DistrictArea> localAreas = areaDAO.searchAreas(district, q);
            if (localAreas != null && !localAreas.isEmpty()) {
                List<Map<String, Object>> response = new ArrayList<>();
                for (DistrictArea area : localAreas) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", area.getAreaName());
                    item.put("subtext", area.getSubtext());
                    item.put("latitude", area.getLatitude() != null ? area.getLatitude().doubleValue() : null);
                    item.put("longitude", area.getLongitude() != null ? area.getLongitude().doubleValue() : null);
                    item.put("pincode", area.getPincode());
                    response.add(item);
                }
                return ResponseEntity.ok(response);
            }

            // 2. Nominatim fallback if no local matches
            String query = (q != null ? q.trim() : "") + " " + district.trim() + " Tamil Nadu";
            String url = NOMINATIM_URL
                    + "?q=" + URLEncoder.encode(query, StandardCharsets.UTF_8)
                    + "&format=json&countrycodes=in&addressdetails=1&limit=10";

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "AnywhereApp/1.0");
            headers.set("Accept", "application/json");

            try {
                ResponseEntity<List> nominatimResponse = restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        new HttpEntity<>(headers),
                        List.class
                );
                return ResponseEntity.ok(mapResults(nominatimResponse.getBody(), district));
            } catch (Exception fallbackEx) {
                return ResponseEntity.ok(Collections.emptyList());
            }
        } catch (Exception ex) {
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @GetMapping("/reverse-geocode")
    public ResponseEntity<Map<String, Object>> reverseGeocode(
            @RequestParam double lat,
            @RequestParam double lon
    ) {
        String url = NOMINATIM_REVERSE_URL
                + "?lat=" + lat
                + "&lon=" + lon
                + "&format=json&addressdetails=1";

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "AnywhereApp/1.0");
        headers.set("Accept", "application/json");

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Map.class
            );
            return ResponseEntity.ok(response.getBody() != null ? response.getBody() : Collections.emptyMap());
        } catch (Exception ex) {
            return ResponseEntity.ok(Collections.emptyMap());
        }
    }

    private List<Map<String, Object>> mapResults(List<?> results, String district) {
        if (results == null) {
            return Collections.emptyList();
        }

        List<Map<String, Object>> mapped = new ArrayList<>();
        for (Object result : results) {
            if (!(result instanceof Map<?, ?> rawResult)) {
                continue;
            }

            Object displayNameValue = rawResult.get("display_name");
            Object latitudeValue = rawResult.get("lat");
            Object longitudeValue = rawResult.get("lon");
            if (displayNameValue == null || latitudeValue == null || longitudeValue == null) {
                continue;
            }

            String displayName = displayNameValue.toString();
            if (!displayName.contains("Tamil Nadu")) {
                continue;
            }

            try {
                String[] parts = displayName.split(",", 2);
                Map<String, Object> item = new HashMap<>();
                item.put("name", parts[0].trim());
                item.put("subtext", parts.length > 1 ? parts[1].trim() : district + ", Tamil Nadu");
                item.put("latitude", Double.parseDouble(latitudeValue.toString()));
                item.put("longitude", Double.parseDouble(longitudeValue.toString()));
                item.put("pincode", null);
                mapped.add(item);
            } catch (NumberFormatException ignored) {
                // Skip malformed coordinates
            }
        }
        return mapped;
    }
}