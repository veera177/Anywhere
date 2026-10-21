package com.app.start_app.config;

import com.app.start_app.security.JwtAuthenticationFilter;
import com.app.start_app.security.JwtUtil;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpStatus;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CharacterEncodingFilter;

import java.util.Arrays;

/**
 * SecurityConfig - Spring Security configuration for JWT-based authentication.
 * 
 * Route Protection Strategy:
 * - PUBLIC: /api/auth/register, /api/auth/login (no authentication required)
 * - PROTECTED: Everything else under /api/** (requires valid JWT token)
 * 
 * Session Management:
 * - Stateless: Each request is independently authenticated via JWT (no session cookies).
 * - CORS: Configured to allow requests from local development (localhost:3000, etc).
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtUtil jwtUtil;

    public SecurityConfig(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /**
     * BCryptPasswordEncoder bean - used by UserDAO for password hashing.
     */
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10); // 10 rounds of hashing
    }

    /**
     * Security filter chain - defines authentication and authorization rules.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Use stateless session (no cookies, JWT-only)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                
                // CORS configuration
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                
                // Disable CSRF (not needed for stateless JWT-based API)
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(exceptions -> exceptions.authenticationEntryPoint((request, response, exception) -> {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Authentication required\"}");
                }))
                
                // Authorization rules
                .authorizeHttpRequests(authz -> authz
                        // Auth endpoints - no auth required
                        .requestMatchers("/api/auth/register").permitAll()
                        .requestMatchers("/api/auth/login").permitAll()

                        // Browse endpoints - public, no login required
                        .requestMatchers("/api/restaurants/**").permitAll()
                        .requestMatchers("/api/food-products/**").permitAll()
                        .requestMatchers("/api/grocery-stores/**").permitAll()
                        .requestMatchers("/api/grocery-products/**").permitAll()
                        .requestMatchers("/api/pharmacies/**").permitAll()
                        .requestMatchers("/api/medicine-products/**").permitAll()
                        .requestMatchers("/api/areas/**").permitAll()
                        .requestMatchers("/api/districts/**").permitAll()
                        .requestMatchers("/api/platform-settings/**").permitAll()
                        .requestMatchers("/api/delivery-fee/**").permitAll()
                        .requestMatchers("/api/distance/**").permitAll()
                        .requestMatchers("/api/coupons/validate").permitAll()

                        // Ratings read — public so shop cards show ratings without login
                        .requestMatchers("/api/ratings/**").permitAll()

                        // Health check - public
                        .requestMatchers("/actuator/health").permitAll()

                        // Admin endpoints require ADMIN role
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // All other /api/** endpoints require authentication
                        .requestMatchers("/api/**").authenticated()

                        // Everything else is allowed (for static content, etc.)
                        .anyRequest().permitAll()
                )
                
                // Add UTF-8 encoding filter before security filters
                .addFilterBefore(
                        characterEncodingFilter(),
                        UsernamePasswordAuthenticationFilter.class
                )

                // Add JWT authentication filter before UsernamePasswordAuthenticationFilter
                .addFilterBefore(
                        jwtAuthenticationFilter(),
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    /**
     * Character encoding filter - forces UTF-8 on all requests/responses.
     * Fixes garbled ₹, ⭐, emoji symbols in API responses.
     */
    @Bean
    public CharacterEncodingFilter characterEncodingFilter() {
        CharacterEncodingFilter filter = new CharacterEncodingFilter();
        filter.setEncoding("UTF-8");
        filter.setForceEncoding(true);
        return filter;
    }

    /**
     * JWT Authentication Filter bean.
     */
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtUtil);
    }

    /**
     * CORS configuration - allows requests from local development.
     * Configured to match origins that may be running during development.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:*",
                "http://127.0.0.1:*",
                "https://*.anywhere.example.com",
                "https://anywhere.example.com"
        ));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setExposedHeaders(Arrays.asList(
                "Content-Type",
                "X-Request-Id",
                "Authorization",
                "X-RateLimit-Remaining",
                "X-RateLimit-Reset"
        ));
        config.setAllowCredentials(false);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
