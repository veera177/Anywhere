package com.app.start_app.area;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.Locale;

/**
 * Serves every district from the `districts` table so the frontend can build
 * district selectors dynamically (no hardcoded district lists in React).
 */
@RestController
@RequestMapping("/api/districts")
@CrossOrigin(origins = "*")
public class DistrictController {

    private final JdbcTemplate jdbcTemplate;

    public DistrictController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public List<Map<String, Object>> getDistricts() {
        boolean courierAvailable = courierEnabled();
        return jdbcTemplate.query(
                """
                SELECT d.id, d.name, d.code,
                       COALESCE(d.latitude, area_center.latitude) AS latitude,
                       COALESCE(d.longitude, area_center.longitude) AS longitude,
                       (SELECT COUNT(*) FROM restaurants r
                         WHERE LOWER(r.district) IN (LOWER(d.name), LOWER(d.code))
                           AND COALESCE(r.is_active, TRUE) = TRUE) AS foodCount,
                       (SELECT COUNT(*) FROM grocery_stores g
                         WHERE LOWER(g.district) IN (LOWER(d.name), LOWER(d.code))
                           AND COALESCE(g.is_active, TRUE) = TRUE) AS groceryCount,
                       (SELECT COUNT(*) FROM pharmacies p
                         WHERE LOWER(p.district) IN (LOWER(d.name), LOWER(d.code))
                           AND COALESCE(p.is_active, TRUE) = TRUE) AS medicineCount,
                       (SELECT COUNT(*) FROM restaurants r
                         WHERE LOWER(r.district) IN (LOWER(d.name), LOWER(d.code))
                           AND COALESCE(r.is_active, TRUE) = TRUE)
                       + (SELECT COUNT(*) FROM grocery_stores g
                         WHERE LOWER(g.district) IN (LOWER(d.name), LOWER(d.code))
                           AND COALESCE(g.is_active, TRUE) = TRUE)
                       + (SELECT COUNT(*) FROM pharmacies p
                         WHERE LOWER(p.district) IN (LOWER(d.name), LOWER(d.code))
                           AND COALESCE(p.is_active, TRUE) = TRUE) AS partnerCount
                FROM districts d
                LEFT JOIN (
                    SELECT district_id, AVG(latitude) latitude, AVG(longitude) longitude
                    FROM district_areas GROUP BY district_id
                ) area_center ON area_center.district_id = d.id
                HAVING partnerCount > 0
                ORDER BY d.name ASC
                """,
                (rs, rowNum) -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", rs.getInt("id"));
                    item.put("name", rs.getString("name"));
                    item.put("code", rs.getString("code"));
                    item.put("latitude", rs.getObject("latitude") != null ? rs.getDouble("latitude") : null);
                    item.put("longitude", rs.getObject("longitude") != null ? rs.getDouble("longitude") : null);
                    int food = rs.getInt("foodCount");
                    int grocery = rs.getInt("groceryCount");
                    int medicine = rs.getInt("medicineCount");
                    item.put("partnerCounts", Map.of("food", food, "grocery", grocery, "medicine", medicine));
                    List<String> services = new ArrayList<>();
                    if (food > 0) services.add("food");
                    if (grocery > 0) services.add("grocery");
                    if (medicine > 0) services.add("medicine");
                    item.put("services", services);
                    item.put("courierAvailable", courierAvailable);
                    item.put("partnerCount", rs.getInt("partnerCount"));
                    return item;
                }
        );
    }

    @GetMapping("/check")
    public Map<String, Object> checkAvailability(@RequestParam(name = "q", defaultValue = "") String query) {
        String q = query == null ? "" : query.trim();
        if (q.isEmpty()) {
            Map<String, Object> empty = new LinkedHashMap<>();
            empty.put("available", false);
            empty.put("district", null);
            empty.put("services", List.of());
            empty.put("partnerCounts", Map.of("food", 0, "grocery", 0, "medicine", 0));
            empty.put("nearestAvailableDistrict", null);
            return empty;
        }

        String pattern = "%" + q.toLowerCase(Locale.ROOT) + "%";
        List<Map<String, Object>> matches = jdbcTemplate.query(
                """
                SELECT d.id, d.name, d.code,
                       COALESCE(d.latitude, a.latitude, ac.latitude) latitude,
                       COALESCE(d.longitude, a.longitude, ac.longitude) longitude,
                       a.area_name, a.subtext, a.pincode,
                       CASE WHEN LOWER(d.name) = ? OR LOWER(d.code) = ? THEN 0
                            WHEN LOWER(d.name) LIKE ? OR LOWER(d.code) LIKE ? THEN 1
                            WHEN LOWER(a.area_name) LIKE ? THEN 2
                            WHEN LOWER(a.subtext) LIKE ? THEN 3
                            WHEN a.pincode LIKE ? THEN 4 ELSE 5 END match_rank
                FROM districts d
                LEFT JOIN district_areas a ON a.district_id = d.id
                LEFT JOIN (SELECT district_id, AVG(latitude) latitude, AVG(longitude) longitude
                           FROM district_areas GROUP BY district_id) ac ON ac.district_id = d.id
                WHERE LOWER(d.name) LIKE ? OR LOWER(d.code) LIKE ?
                   OR LOWER(a.area_name) LIKE ? OR LOWER(a.subtext) LIKE ? OR a.pincode LIKE ?
                ORDER BY match_rank, d.name, a.area_name
                LIMIT 1
                """,
                (rs, rowNum) -> {
                    Map<String, Object> match = new LinkedHashMap<>();
                    match.put("id", rs.getInt("id"));
                    match.put("name", rs.getString("name"));
                    match.put("code", rs.getString("code"));
                    match.put("latitude", rs.getObject("latitude") == null ? null : rs.getDouble("latitude"));
                    match.put("longitude", rs.getObject("longitude") == null ? null : rs.getDouble("longitude"));
                    match.put("areaName", rs.getString("area_name"));
                    return match;
                },
                q.toLowerCase(Locale.ROOT), q.toLowerCase(Locale.ROOT), pattern, pattern,
                pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern
        );

        Map<String, Object> district = matches.isEmpty() ? null : matches.get(0);
        Map<String, Object> result = district == null
                ? new LinkedHashMap<>()
                : availabilityFor((Integer) district.get("id"));
        boolean available = Boolean.TRUE.equals(result.get("available"));
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("available", available);
        response.put("district", district);
        List<String> services = new ArrayList<>((List<String>) result.getOrDefault("services", List.of()));
        boolean courierAvailable = courierEnabled();
        if (courierAvailable) services.add("courier");
        response.put("services", services);
        response.put("courierAvailable", courierAvailable);
        response.put("partnerCounts", result.getOrDefault("partnerCounts", Map.of("food", 0, "grocery", 0, "medicine", 0)));
        response.put("nearestAvailableDistrict", available || district == null ? null : findNearestAvailable(district));
        return response;
    }

    private Map<String, Object> availabilityFor(Integer districtId) {
        if (districtId == null) return Map.of();
        boolean courierAvailable = courierEnabled();
        List<Map<String, Object>> rows = jdbcTemplate.query(
                """
                SELECT d.id, d.name, d.code,
                       (SELECT COUNT(*) FROM restaurants r WHERE LOWER(r.district) IN (LOWER(d.name), LOWER(d.code)) AND COALESCE(r.is_active, TRUE) = TRUE) food,
                       (SELECT COUNT(*) FROM grocery_stores g WHERE LOWER(g.district) IN (LOWER(d.name), LOWER(d.code)) AND COALESCE(g.is_active, TRUE) = TRUE) grocery,
                       (SELECT COUNT(*) FROM pharmacies p WHERE LOWER(p.district) IN (LOWER(d.name), LOWER(d.code)) AND COALESCE(p.is_active, TRUE) = TRUE) medicine
                FROM districts d WHERE d.id = ?
                """,
                (rs, rowNum) -> {
                    int food = rs.getInt("food"), grocery = rs.getInt("grocery"), medicine = rs.getInt("medicine");
                    List<String> services = new ArrayList<>();
                    if (food > 0) services.add("food");
                    if (grocery > 0) services.add("grocery");
                    if (medicine > 0) services.add("medicine");
                    Map<String, Object> counts = Map.of("food", food, "grocery", grocery, "medicine", medicine);
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("available", food + grocery + medicine > 0);
                    row.put("courierAvailable", courierAvailable);
                    row.put("services", services);
                    row.put("partnerCounts", counts);
                    row.put("district", Map.of("id", rs.getInt("id"), "name", rs.getString("name"), "code", rs.getString("code")));
                    return row;
                }, districtId
        );
        return rows.isEmpty() ? Map.of() : rows.get(0);
    }

    private Map<String, Object> findNearestAvailable(Map<String, Object> requested) {
        Object lat = requested.get("latitude"), lon = requested.get("longitude");
        if (lat == null || lon == null) return null;
        List<Map<String, Object>> candidates = jdbcTemplate.query(
                """
                SELECT d.id, d.name, d.code,
                       COALESCE(d.latitude, ac.latitude) latitude,
                       COALESCE(d.longitude, ac.longitude) longitude
                FROM districts d
                LEFT JOIN (SELECT district_id, AVG(latitude) latitude, AVG(longitude) longitude
                           FROM district_areas GROUP BY district_id) ac ON ac.district_id = d.id
                WHERE EXISTS (SELECT 1 FROM restaurants r WHERE LOWER(r.district) IN (LOWER(d.name),LOWER(d.code)) AND COALESCE(r.is_active,TRUE)=TRUE)
                   OR EXISTS (SELECT 1 FROM grocery_stores g WHERE LOWER(g.district) IN (LOWER(d.name),LOWER(d.code)) AND COALESCE(g.is_active,TRUE)=TRUE)
                   OR EXISTS (SELECT 1 FROM pharmacies p WHERE LOWER(p.district) IN (LOWER(d.name),LOWER(d.code)) AND COALESCE(p.is_active,TRUE)=TRUE)
                """,
                (rs, rowNum) -> {
                    Map<String, Object> candidate = new LinkedHashMap<>();
                    candidate.put("id", rs.getInt("id")); candidate.put("name", rs.getString("name")); candidate.put("code", rs.getString("code"));
                    candidate.put("latitude", rs.getObject("latitude") == null ? null : rs.getDouble("latitude"));
                    candidate.put("longitude", rs.getObject("longitude") == null ? null : rs.getDouble("longitude"));
                    return candidate;
                }
        );
        double sourceLat = ((Number) lat).doubleValue(), sourceLon = ((Number) lon).doubleValue();
        return candidates.stream().filter(c -> c.get("latitude") != null && c.get("longitude") != null)
                .min(java.util.Comparator.comparingDouble(c -> distanceKm(sourceLat, sourceLon,
                        ((Number) c.get("latitude")).doubleValue(), ((Number) c.get("longitude")).doubleValue())))
                .orElse(null);
    }

    private boolean courierEnabled() {
        List<String> values = jdbcTemplate.query("SELECT setting_value FROM platform_settings WHERE setting_key = ?",
                (rs, rowNum) -> rs.getString(1), "delivery.courier.radius_km");
        return !values.isEmpty() && Double.parseDouble(values.get(0)) > 0;
    }

    private double distanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1), dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
