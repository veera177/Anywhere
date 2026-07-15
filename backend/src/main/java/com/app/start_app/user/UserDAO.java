package com.app.start_app.user;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class UserDAO {

    private final JdbcTemplate jdbcTemplate;

    public UserDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Register User
    public int registerUser(User user) {

        String sql = """
                INSERT INTO users
                (full_name, email, phone, password)
                VALUES (?, ?, ?, ?)
                """;

        return jdbcTemplate.update(
                sql,
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getPassword()
        );
    }

    // Login User
    public User loginUser(String email, String password) {

        String sql = """
                SELECT *
                FROM users
                WHERE email = ? AND password = ?
                """;

        try {

            return jdbcTemplate.queryForObject(
                    sql,
                    (rs, rowNum) -> {

                        User user = new User();

                        user.setId(rs.getInt("id"));
                        user.setFullName(rs.getString("full_name"));
                        user.setEmail(rs.getString("email"));
                        user.setPhone(rs.getString("phone"));
                        user.setPassword(rs.getString("password"));
                        user.setRole(rs.getString("role"));
                        user.setAddressLine(rs.getString("address_line"));
                        user.setLandmark(rs.getString("landmark"));
                        user.setDistrict(rs.getString("district"));
                        user.setTown(rs.getString("town"));
                        user.setAreaType(rs.getString("area_type"));
                        user.setCreatedAt(rs.getTimestamp("created_at"));

                        return user;
                    },
                    email,
                    password
            );

        } catch (Exception e) {
            return null;
        }
    }

    public User getUserById(Integer id) {

        String sql = """
                SELECT *
                FROM users
                WHERE id = ?
                """;

        try {

            return jdbcTemplate.queryForObject(
                    sql,
                    (rs, rowNum) -> {

                        User user = new User();

                        user.setId(rs.getInt("id"));
                        user.setFullName(rs.getString("full_name"));
                        user.setEmail(rs.getString("email"));
                        user.setPhone(rs.getString("phone"));
                        user.setPassword(null);
                        user.setRole(rs.getString("role"));
                        user.setAddressLine(rs.getString("address_line"));
                        user.setLandmark(rs.getString("landmark"));
                        user.setDistrict(rs.getString("district"));
                        user.setTown(rs.getString("town"));
                        user.setAreaType(rs.getString("area_type"));
                        user.setCreatedAt(rs.getTimestamp("created_at"));

                        return user;
                    },
                    id
            );

        } catch (Exception e) {
            return null;
        }
    }

    public int updateProfile(Integer id, User user) {

        String sql = """
                UPDATE users
                SET full_name = ?,
                    email = ?,
                    phone = ?,
                    address_line = ?,
                    landmark = ?,
                    district = ?,
                    town = ?,
                    area_type = ?
                WHERE id = ?
                """;

        return jdbcTemplate.update(
                sql,
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddressLine(),
                user.getLandmark(),
                user.getDistrict(),
                user.getTown(),
                user.getAreaType(),
                id
        );
    }
}
