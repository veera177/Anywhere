package com.app.start_app.area;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.List;

@Repository
public class AreaDAO {

    private final JdbcTemplate jdbcTemplate;

    public AreaDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<DistrictArea> searchAreas(String district, String query) {
        if (district == null || district.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String cleanedDistrict = district.trim().toLowerCase();
        String searchPattern = "%" + (query != null ? query.trim().toLowerCase() : "") + "%";

        String sql = """
                SELECT a.id, a.district_id, a.area_name, a.subtext, a.latitude, a.longitude, a.pincode, a.created_at
                FROM district_areas a
                JOIN districts d ON a.district_id = d.id
                WHERE (LOWER(d.name) = ? OR LOWER(d.code) = ? OR CAST(d.id AS CHAR) = ?)
                  AND (LOWER(a.area_name) LIKE ? OR LOWER(a.subtext) LIKE ?)
                ORDER BY
                  CASE
                    WHEN LOWER(a.area_name) LIKE ? THEN 1
                    WHEN LOWER(a.area_name) LIKE ? THEN 2
                    ELSE 3
                  END,
                  a.area_name ASC
                LIMIT 15
                """;

        String exactPrefix = (query != null ? query.trim().toLowerCase() : "") + "%";

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new DistrictArea(
                        rs.getInt("id"),
                        rs.getInt("district_id"),
                        rs.getString("area_name"),
                        rs.getString("subtext"),
                        rs.getBigDecimal("latitude"),
                        rs.getBigDecimal("longitude"),
                        rs.getString("pincode"),
                        rs.getTimestamp("created_at")
                ),
                cleanedDistrict,
                cleanedDistrict,
                cleanedDistrict,
                searchPattern,
                searchPattern,
                exactPrefix,
                searchPattern
        );
    }
}