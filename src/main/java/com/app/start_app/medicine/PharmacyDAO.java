package com.app.start_app.medicine;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class PharmacyDAO {

    private final JdbcTemplate jdbcTemplate;

    public PharmacyDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // GET PHARMACIES
    public List<Pharmacy> getPharmacies(String district) {

        String sql = """
                SELECT *
                FROM pharmacies
                WHERE (? IS NULL OR LOWER(district) = LOWER(?))
                ORDER BY rating DESC
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {
                    Pharmacy p = new Pharmacy(
                            rs.getInt("id"),
                            rs.getString("name"),
                            rs.getString("district"),
                            rs.getDouble("rating"),
                            rs.getString("location"),
                            rs.getString("delivery_type")
                    );
                    try { p.setRatingCount(rs.getInt("rating_count")); } catch (Exception ignored) {}
                    p.setLatitude(rs.getObject("latitude", Double.class));
                    p.setLongitude(rs.getObject("longitude", Double.class));
                    return p;
                },
                district,
                district
        );
    }
}
