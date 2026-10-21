package com.app.start_app.platform;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/platform-settings")
@CrossOrigin(origins = "*")
public class PlatformSettingController {

    private final JdbcTemplate jdbcTemplate;

    public PlatformSettingController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public List<PlatformSetting> getSettings() {
        return jdbcTemplate.query(
                "SELECT setting_key, setting_value FROM platform_settings ORDER BY setting_key",
                (rs, rowNum) -> {
                    PlatformSetting setting = new PlatformSetting();
                    setting.setSettingKey(rs.getString("setting_key"));
                    setting.setSettingValue(rs.getString("setting_value"));
                    return setting;
                }
        );
    }

    @PutMapping("/{key}")
    public PlatformSetting updateSetting(@PathVariable String key, @RequestBody PlatformSetting request) {
        String value = request.getSettingValue() == null ? "" : request.getSettingValue();
        jdbcTemplate.update("""
                INSERT INTO platform_settings (setting_key, setting_value)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
                """, key, value);

        PlatformSetting setting = new PlatformSetting();
        setting.setSettingKey(key);
        setting.setSettingValue(value);
        return setting;
    }
}
