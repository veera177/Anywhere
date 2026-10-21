package com.app.start_app.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * JwtUtil - Handles JWT token generation and validation.
 * - Tokens are signed with HS256 (HMAC SHA-256) using a secret key from environment.
 * - Token includes userId, email, and role as claims.
 * - Expiry is configurable (default 7 hours / 25200000 ms via jwt.expiration.ms).
 * - Never hardcode the secret - always use JWT_SECRET environment variable.
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration.ms}")
    private long jwtExpirationMs;

    /**
     * Generate a JWT token for a user.
     * Claims included: userId, email, role.
     * @param userId User ID
     * @param email User email
     * @param role User role (e.g., "CUSTOMER", "ADMIN")
     * @return JWT token string
     */
    public String generateToken(Integer userId, String email, String role) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("email", email)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Validate a JWT token.
     * @param token JWT token string
     * @return true if valid, false if invalid or expired
     */
    public boolean validateToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Extract all claims from a token.
     * @param token JWT token string
     * @return Claims object, or null if invalid
     */
    public Claims extractClaims(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Extract userId from token claims.
     * @param token JWT token string
     * @return userId, or null if not found
     */
    public Integer extractUserId(String token) {
        Claims claims = extractClaims(token);
        if (claims == null) return null;
        Object userId = claims.get("userId");
        if (userId instanceof Number) {
            return ((Number) userId).intValue();
        }
        return null;
    }

    /**
     * Extract email from token claims.
     * @param token JWT token string
     * @return email, or null if not found
     */
    public String extractEmail(String token) {
        Claims claims = extractClaims(token);
        return claims != null ? (String) claims.get("email") : null;
    }

    /**
     * Extract role from token claims.
     * @param token JWT token string
     * @return role, or null if not found
     */
    public String extractRole(String token) {
        Claims claims = extractClaims(token);
        return claims != null ? (String) claims.get("role") : null;
    }
}
