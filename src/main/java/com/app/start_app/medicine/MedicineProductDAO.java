package com.app.start_app.medicine;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class MedicineProductDAO {

    private final JdbcTemplate jdbcTemplate;

    public MedicineProductDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // GET MEDICINE PRODUCTS
    public List<MedicineProduct> getMedicineProducts(String district, Integer pharmacyId) {
        return getMedicineProducts(district, pharmacyId, null, null);
    }

    public List<MedicineProduct> getMedicineProducts(String district, Integer pharmacyId, String name) {
        return getMedicineProducts(district, pharmacyId, name, null);
    }

    public List<MedicineProduct> getMedicineProducts(String district, Integer pharmacyId, String name, Boolean inStock) {

        String sql = """
                SELECT
                    mp.*,
                    p.name AS pharmacy_name
                FROM medicine_products mp
                JOIN pharmacies p
                ON mp.pharmacy_id = p.id
                WHERE mp.available = TRUE
                  AND (? IS NULL OR EXISTS (
                      SELECT 1
                      FROM districts d
                      WHERE (LOWER(d.code) = LOWER(?) OR LOWER(d.name) = LOWER(?))
                        AND (LOWER(mp.district) = LOWER(d.code)
                             OR LOWER(mp.district) = LOWER(d.name))
                  ))
                  AND (? IS NULL OR mp.pharmacy_id = ?)
                  AND (? IS NULL OR LOWER(mp.name) LIKE LOWER(?)
                       OR LOWER(mp.category) LIKE LOWER(?)
                       OR LOWER(p.name) LIKE LOWER(?))
                  AND (NOT ? OR mp.stock > 0)
                ORDER BY
                  CASE WHEN ? IS NULL THEN 0
                       WHEN LOWER(mp.name) = LOWER(?) THEN 0
                       WHEN LOWER(mp.name) LIKE LOWER(?) THEN 1
                       ELSE 2 END,
                  CASE WHEN mp.stock > 0 THEN 0 ELSE 1 END,
                  mp.rating DESC
                LIMIT 10
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {
                    String scheduleType = safeColumn(rs, "schedule_type", "OTC");
                    boolean requiresPrescription = safeBoolColumn(rs, "requires_prescription", false);
                    return new MedicineProduct(
                            rs.getInt("id"),
                            rs.getString("district"),
                            rs.getString("category"),
                            rs.getString("name"),
                            rs.getString("description"),
                            rs.getDouble("price"),
                            rs.getInt("stock"),
                            rs.getDouble("rating"),
                            rs.getString("offer_tag"),
                            rs.getString("dosage"),
                            rs.getString("image_url"),
                            rs.getBoolean("available"),
                            rs.getString("pharmacy_name"),
                            rs.getObject("pharmacy_id", Integer.class),
                            scheduleType,
                            requiresPrescription
                    );
                },
                district,
                district,
                district,
                pharmacyId,
                pharmacyId,
                name,
                name == null ? null : "%" + name + "%",
                name == null ? null : "%" + name + "%",
                name == null ? null : "%" + name + "%",
                Boolean.TRUE.equals(inStock),
                name,
                name,
                name == null ? null : name + "%"
        );
    }

    // REDUCE STOCK
    public void reduceStock(int productId) {

        String sql = """
                UPDATE medicine_products
                SET stock = stock - 1
                WHERE id = ?
                AND stock > 0
                """;

        jdbcTemplate.update(sql, productId);
    }

    /**
     * Safely read a column that may not exist in the table schema.
     * Returns the default value if the column is missing.
     */
    private static String safeColumn(java.sql.ResultSet rs, String column, String defaultValue) {
        try {
            String val = rs.getString(column);
            return val != null ? val : defaultValue;
        } catch (java.sql.SQLException e) {
            return defaultValue;
        }
    }

    private static boolean safeBoolColumn(java.sql.ResultSet rs, String column, boolean defaultValue) {
        try {
            return rs.getBoolean(column);
        } catch (java.sql.SQLException e) {
            return defaultValue;
        }
    }
}
