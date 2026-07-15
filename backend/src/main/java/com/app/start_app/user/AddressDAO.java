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
                ORDER BY id DESC
                """;

        return jdbcTemplate.query(sql, this::mapAddress, userId);
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
                (user_id, title, address, city, district, pincode)
                VALUES (?, ?, ?, ?, ?, ?)
                """;

        return jdbcTemplate.update(
                sql,
                userId,
                address.getTitle(),
                address.getAddress(),
                address.getCity(),
                address.getDistrict(),
                address.getPincode()
        );
    }

    public int updateAddress(Integer userId, Integer addressId, Address address) {
        String sql = """
                UPDATE addresses
                SET title = ?,
                    address = ?,
                    city = ?,
                    district = ?,
                    pincode = ?
                WHERE user_id = ? AND id = ?
                """;

        return jdbcTemplate.update(
                sql,
                address.getTitle(),
                address.getAddress(),
                address.getCity(),
                address.getDistrict(),
                address.getPincode(),
                userId,
                addressId
        );
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

        return address;
    }
}
