package com.app.start_app.user;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class AddressDAO {

    private final JdbcTemplate jdbcTemplate;

    public AddressDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Address> getAddressesByUserId(Integer userId) {
        String sql = """
                SELECT *
                FROM addresses
                WHERE user_id = ?
                ORDER BY is_default DESC, id DESC
                """;

        return jdbcTemplate.query(sql, this::mapAddress, userId);
    }

    public Address getDefaultAddress(Integer userId) {
        String sql = """
                SELECT *
                FROM addresses
                WHERE user_id = ?
                ORDER BY is_default DESC, id DESC
                LIMIT 1
                """;

        try {
            return jdbcTemplate.queryForObject(sql, this::mapAddress, userId);
        } catch (Exception e) {
            return null;
        }
    }

    public Address getAddressById(Integer userId, Integer addressId) {
        String sql = """
                SELECT *
                FROM addresses
                WHERE user_id = ? AND id = ?
                """;

        try {
            return jdbcTemplate.queryForObject(sql, this::mapAddress, userId, addressId);
        } catch (Exception e) {
            return null;
        }
    }

    public int addAddress(Integer userId, Address address) {
        String sql = """
                INSERT INTO addresses
                (user_id, title, address, city, district, pincode, latitude, longitude, address_type, is_default)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;

        int rows = jdbcTemplate.update(
                sql,
                userId,
                address.getTitle(),
                address.getAddress(),
                address.getCity(),
                address.getDistrict(),
                address.getPincode(),
                address.getLatitude(),
                address.getLongitude(),
                normalizeAddressType(address.getAddressType()),
                Boolean.TRUE.equals(address.getIsDefault()) ? 1 : 0
        );

        if (rows > 0 && Boolean.TRUE.equals(address.getIsDefault())) {
            promoteDefault(userId);
        }

        return rows;
    }

    public int updateAddress(Integer userId, Integer addressId, Address address) {
        String sql = """
                UPDATE addresses
                SET title = ?,
                    address = ?,
                    city = ?,
                    district = ?,
                    pincode = ?,
                    latitude = ?,
                    longitude = ?,
                    address_type = ?
                WHERE user_id = ? AND id = ?
                """;

        int rows = jdbcTemplate.update(
                sql,
                address.getTitle(),
                address.getAddress(),
                address.getCity(),
                address.getDistrict(),
                address.getPincode(),
                address.getLatitude(),
                address.getLongitude(),
                normalizeAddressType(address.getAddressType()),
                userId,
                addressId
        );

        if (rows > 0 && Boolean.TRUE.equals(address.getIsDefault())) {
            promoteDefault(userId);
        }

        return rows;
    }

    public int setDefaultAddress(Integer userId, Integer addressId) {
        if (getAddressById(userId, addressId) == null) {
            return 0;
        }
        promoteDefault(userId);
        return jdbcTemplate.update(
                "UPDATE addresses SET is_default = 1 WHERE user_id = ? AND id = ?",
                userId,
                addressId
        );
    }

    private void promoteDefault(Integer userId) {
        jdbcTemplate.update("UPDATE addresses SET is_default = 0 WHERE user_id = ?", userId);
        jdbcTemplate.update(
                "UPDATE addresses SET is_default = 1 WHERE user_id = ? ORDER BY id ASC LIMIT 1",
                userId
        );
    }

    private String normalizeAddressType(String addressType) {
        if (addressType == null || addressType.isBlank()) {
            return "HOME";
        }
        return addressType.trim().toUpperCase();
    }

    public int deleteAddress(Integer userId, Integer addressId) {
        String sql = """
                DELETE FROM addresses
                WHERE user_id = ? AND id = ?
                """;

        return jdbcTemplate.update(sql, userId, addressId);
    }

    private Address mapAddress(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        Address address = new Address();

        address.setId(rs.getInt("id"));
        address.setUserId(rs.getInt("user_id"));
        address.setTitle(rs.getString("title"));
        address.setAddress(rs.getString("address"));
        address.setCity(rs.getString("city"));
        address.setDistrict(rs.getString("district"));
        address.setPincode(rs.getString("pincode"));

        double latitude = rs.getDouble("latitude");
        double longitude = rs.getDouble("longitude");
        address.setLatitude(rs.wasNull() ? null : latitude);
        address.setLongitude(rs.wasNull() ? null : longitude);
        address.setAddressType(rs.getString("address_type"));
        address.setIsDefault(rs.getInt("is_default") == 1);

        return address;
    }
}
