package com.app.start_app.security;

import io.jsonwebtoken.Claims;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Collections;

/**
 * JwtAuthenticationFilter - Intercepts incoming requests and validates JWT tokens.
 * - Extracts token from Authorization: Bearer {token} header.
 * - Validates the token using JwtUtil.
 * - Extracts userId, email, and role from token claims.
 * - Creates a Spring Security Authentication object and sets it in the SecurityContext.
 * - Stores claims as request attributes for use by controllers that read them directly.
 * - Returns 401 Unauthorized if token is missing or invalid.
 * - Allows requests without tokens to proceed (interceptor handles public vs protected routes).
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // Remove "Bearer " prefix
        }
        // Native EventSource cannot attach Authorization headers. Restrict this
        // compatibility path to the protected order stream only.
        if ((token == null || token.isEmpty()) && request.getRequestURI().matches(".*/api/orders/\\d+/stream")) {
            token = request.getParameter("access_token");
        }

        if (token != null && !token.isEmpty()) {
            try {
                if (jwtUtil.validateToken(token)) {
                    // Token is valid - extract claims
                    Claims claims = jwtUtil.extractClaims(token);
                    if (claims != null) {
                        Object userIdObj = claims.get("userId");
                        Integer userId = userIdObj instanceof Number ? ((Number) userIdObj).intValue() : null;
                        String email = (String) claims.get("email");
                        String role = (String) claims.get("role");

                        if (userId != null) {
                            // Store in request attributes for controllers that read them directly
                            request.setAttribute("userId", userId);
                            request.setAttribute("email", email);
                            request.setAttribute("role", role);
                            request.setAttribute("authenticated", true);

                            // Create Spring Security Authentication object
                            // Principal = userId (Integer), Credentials = empty (already verified)
                            // Authorities derived from JWT role
                            String authority = (role != null && !role.isBlank())
                                    ? "ROLE_" + role.toUpperCase()
                                    : "ROLE_CUSTOMER";

                            UsernamePasswordAuthenticationToken authentication =
                                    new UsernamePasswordAuthenticationToken(
                                            userId,   // principal — matches what controllers read
                                            null,     // credentials — already validated
                                            Collections.singletonList(new SimpleGrantedAuthority(authority))
                                    );

                            // Set in SecurityContext so .authenticated() passes in SecurityFilterChain
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                        }
                    }
                } else {
                    // Public browsing and general AI chat must still work if the
                    // browser happens to send an old token. Protected routes keep
                    // the strict 401 response and therefore cannot use it to gain
                    // access to account, cart, order, or payment data.
                    if (!isPublicRequest(request)) {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"error\": \"Invalid or expired token\"}");
                        return;
                    }
                    // For public routes with an invalid token: clear context and proceed
                }
            } catch (Exception e) {
                // If token processing fails and this is a protected route, return 401.
                // For public routes, allow the request to proceed unauthenticated.
                if (!isPublicRequest(request)) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"Authentication failed\"}");
                    return;
                }
            }
        }
        // If no token is provided, SecurityContext remains empty (unauthenticated)
        // — Spring Security will handle authorization based on .authenticated() rules

        // Continue to next filter/controller
        filterChain.doFilter(request, response);
    }

    private boolean isPublicRequest(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/auth/")
                || path.startsWith("/api/ai/")
                || path.startsWith("/api/restaurants/")
                || path.startsWith("/api/food-products/")
                || path.startsWith("/api/grocery-stores/")
                || path.startsWith("/api/grocery-products/")
                || path.startsWith("/api/pharmacies/")
                || path.startsWith("/api/medicine-products/")
                || path.startsWith("/api/districts/")
                || path.startsWith("/api/areas/")
                || path.startsWith("/api/platform-settings/")
                || path.startsWith("/api/delivery-fee/")
                || path.startsWith("/api/distance/")
                || path.startsWith("/actuator/health");
    }
}
