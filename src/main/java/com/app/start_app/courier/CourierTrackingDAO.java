package com.app.start_app.courier;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public class CourierTrackingDAO {

    private final JdbcTemplate jdbcTemplate;

    public CourierTrackingDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Integer insertRoute(CourierRoute route) {
        String sql = """
                INSERT INTO courier_routes
                (user_id, courier_id, order_id, status,
                 pickup_latitude, pickup_longitude, delivery_latitude, delivery_longitude,
                 pickup_address, delivery_address, map_url, estimated_duration_minutes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            if (route.getUserId() == null) statement.setNull(1, Types.INTEGER);
            else statement.setInt(1, route.getUserId());
            if (route.getCourierId() == null) statement.setNull(2, Types.INTEGER);
            else statement.setInt(2, route.getCourierId());
            if (route.getOrderId() == null) statement.setNull(3, Types.BIGINT);
            else statement.setLong(3, route.getOrderId());
            statement.setString(4, route.getStatus() == null ? "PENDING" : route.getStatus());
            statement.setDouble(5, route.getPickupLatitude());
            statement.setDouble(6, route.getPickupLongitude());
            statement.setDouble(7, route.getDeliveryLatitude());
            statement.setDouble(8, route.getDeliveryLongitude());
            statement.setString(9, route.getPickupAddress());
            statement.setString(10, route.getDeliveryAddress());
            statement.setString(11, route.getMapUrl());
            statement.setInt(12, route.getEstimatedDurationMinutes());
            return statement;
        }, keyHolder);
        return keyHolder.getKey().intValue();
    }

    public Integer insertLocation(RouteLocation location) {
        String sql = """
                INSERT INTO route_locations
                (route_id, location_type, location_name, latitude, longitude, address,
                 contact_name, contact_phone, status, distance_from_previous, sort_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            statement.setInt(1, location.getRouteId());
            statement.setString(2, location.getLocationType());
            statement.setString(3, location.getLocationName());
            statement.setDouble(4, location.getLatitude());
            statement.setDouble(5, location.getLongitude());
            statement.setString(6, location.getAddress());
            statement.setString(7, location.getContactName());
            statement.setString(8, location.getContactPhone());
            statement.setString(9, location.getStatus() == null ? "PENDING" : location.getStatus());
            if (location.getDistanceFromPrevious() == null) statement.setNull(10, Types.DOUBLE);
            else statement.setDouble(10, location.getDistanceFromPrevious());
            statement.setInt(11, location.getSortOrder());
            return statement;
        }, keyHolder);
        return keyHolder.getKey().intValue();
    }

    public CourierRoute findRouteById(Integer routeId) {
        String sql = """
                SELECT *
                FROM courier_routes
                WHERE id = ?
                """;
        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                CourierRoute route = new CourierRoute();
                route.setId(rs.getInt("id"));
                route.setUserId((Integer) rs.getObject("user_id"));
                route.setCourierId((Integer) rs.getObject("courier_id"));
                route.setOrderId((Long) rs.getObject("order_id"));
                route.setStatus(rs.getString("status"));
                route.setPickupLatitude(rs.getDouble("pickup_latitude"));
                route.setPickupLongitude(rs.getDouble("pickup_longitude"));
                route.setDeliveryLatitude(rs.getDouble("delivery_latitude"));
                route.setDeliveryLongitude(rs.getDouble("delivery_longitude"));
                route.setPickupAddress(rs.getString("pickup_address"));
                route.setDeliveryAddress(rs.getString("delivery_address"));
                route.setMapUrl(rs.getString("map_url"));
                route.setEstimatedDurationMinutes(rs.getInt("estimated_duration_minutes"));
                route.setActualDurationMinutes((Integer) rs.getObject("actual_duration_minutes"));
                route.setCreatedAt(toLocalDateTime(rs.getTimestamp("created_at")));
                route.setStartedAt(toLocalDateTime(rs.getTimestamp("started_at")));
                route.setCompletedAt(toLocalDateTime(rs.getTimestamp("completed_at")));
                return route;
            }, routeId);
        } catch (Exception e) {
            return null;
        }
    }

    public List<RouteLocation> findLocationsByRouteId(Integer routeId) {
        String sql = """
                SELECT *
                FROM route_locations
                WHERE route_id = ?
                ORDER BY sort_order ASC, id ASC
                """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            RouteLocation location = new RouteLocation();
            location.setId(rs.getInt("id"));
            location.setRouteId(rs.getInt("route_id"));
            location.setLocationType(rs.getString("location_type"));
            location.setLocationName(rs.getString("location_name"));
            location.setLatitude(rs.getDouble("latitude"));
            location.setLongitude(rs.getDouble("longitude"));
            location.setAddress(rs.getString("address"));
            location.setContactName(rs.getString("contact_name"));
            location.setContactPhone(rs.getString("contact_phone"));
            location.setStatus(rs.getString("status"));
            location.setDistanceFromPrevious(toDouble(rs.getBigDecimal("distance_from_previous")));
            location.setArrivalTime(toLocalDateTime(rs.getTimestamp("arrival_time")));
            location.setCompletionTime(toLocalDateTime(rs.getTimestamp("completion_time")));
            location.setSortOrder(rs.getInt("sort_order"));
            return location;
        }, routeId);
    }

    public RouteLocation findLocationById(Integer locationId) {
        String sql = """
                SELECT *
                FROM route_locations
                WHERE id = ?
                """;
        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                RouteLocation location = new RouteLocation();
                location.setId(rs.getInt("id"));
                location.setRouteId(rs.getInt("route_id"));
                location.setLocationType(rs.getString("location_type"));
                location.setLocationName(rs.getString("location_name"));
                location.setLatitude(rs.getDouble("latitude"));
                location.setLongitude(rs.getDouble("longitude"));
                location.setAddress(rs.getString("address"));
                location.setContactName(rs.getString("contact_name"));
                location.setContactPhone(rs.getString("contact_phone"));
                location.setStatus(rs.getString("status"));
                location.setDistanceFromPrevious(toDouble(rs.getBigDecimal("distance_from_previous")));
                location.setArrivalTime(toLocalDateTime(rs.getTimestamp("arrival_time")));
                location.setCompletionTime(toLocalDateTime(rs.getTimestamp("completion_time")));
                location.setSortOrder(rs.getInt("sort_order"));
                return location;
            }, locationId);
        } catch (Exception e) {
            return null;
        }
    }

    public int updateRouteStatus(Integer routeId, String status, LocalDateTime startedAt, LocalDateTime completedAt) {
        return jdbcTemplate.update(
                "UPDATE courier_routes SET status = ?, started_at = ?, completed_at = ? WHERE id = ?",
                status,
                startedAt == null ? null : Timestamp.valueOf(startedAt),
                completedAt == null ? null : Timestamp.valueOf(completedAt),
                routeId
        );
    }

    public int updateRouteActualDuration(Integer routeId, Integer minutes) {
        return jdbcTemplate.update(
                "UPDATE courier_routes SET actual_duration_minutes = ? WHERE id = ?",
                minutes,
                routeId
        );
    }

    public int updateLocationStatus(Integer locationId, String status, boolean completed) {
        if (completed) {
            return jdbcTemplate.update(
                    "UPDATE route_locations SET status = ?, completion_time = CURRENT_TIMESTAMP WHERE id = ?",
                    status,
                    locationId
            );
        }
        return jdbcTemplate.update(
                "UPDATE route_locations SET status = ?, arrival_time = CURRENT_TIMESTAMP WHERE id = ?",
                status,
                locationId
        );
    }

    public int nextSortOrder(Integer routeId) {
        Integer value = jdbcTemplate.queryForObject(
                "SELECT COALESCE(MAX(sort_order), 0) + 1 FROM route_locations WHERE route_id = ?",
                Integer.class,
                routeId
        );
        return value == null ? 1 : value;
    }

    private LocalDateTime toLocalDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }

    private Double toDouble(java.math.BigDecimal value) {
        return value == null ? null : value.doubleValue();
    }
}