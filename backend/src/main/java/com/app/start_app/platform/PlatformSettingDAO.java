package com.app.start_app.platform;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.util.List;

@Repository
public class PlatformSettingDAO {

    private final JdbcTemplate jdbcTemplate;

    public PlatformSettingDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void createTableIfNotExists() {
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS platform_settings (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    setting_key VARCHAR(150) UNIQUE NOT NULL,
                    setting_value VARCHAR(150) NOT NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
                """);
    }

    public BigDecimal getDecimal(String key) {
        String value = getValue(key);
        if (value == null || value.isBlank()) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal(value.trim());
    }

    public BigDecimal getRequiredDecimal(String key) {
        String value = getValue(key);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Missing platform setting: " + key);
        }
        return new BigDecimal(value.trim());
    }

    public boolean getBoolean(String key) {
        String value = getValue(key);
        return "true".equalsIgnoreCase(value) || "1".equals(value);
    }

    public String getValue(String key) {
        List<String> values = jdbcTemplate.query(
                "SELECT setting_value FROM platform_settings WHERE setting_key = ?",
                (rs, rowNum) -> rs.getString("setting_value"),
                key
        );
        return values.isEmpty() ? null : values.get(0);
    }
}
