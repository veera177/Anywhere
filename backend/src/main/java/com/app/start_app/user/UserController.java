package com.app.start_app.user;

import com.app.start_app.security.AuthResponse;
import com.app.start_app.security.JwtUtil;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final UserDAO userDAO;
    private final JwtUtil jwtUtil;

    public UserController(UserDAO userDAO, JwtUtil jwtUtil) {
        this.userDAO = userDAO;
        this.jwtUtil = jwtUtil;
    }

    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {

        try {
            int result = userDAO.registerUser(user);

            if (result > 0) {
                return ResponseEntity.ok("Registration Successful");
            }

            return ResponseEntity.badRequest().body("Registration Failed");
        } catch (DuplicateKeyException e) {
            return ResponseEntity.badRequest().body("Email already exists");
        } catch (DataAccessException e) {
            return ResponseEntity.status(503).body("Database connection failed. Please check MySQL username and password.");
        }
    }

    // LOGIN - returns JWT token + user info
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {

        try {
            User loggedInUser = userDAO.loginUser(
                    user.getEmail(),
                    user.getPassword()
            );

            if (loggedInUser == null) {
                return ResponseEntity.status(401).body("Invalid Email or Password");
            }

            // Generate JWT token
            String token = jwtUtil.generateToken(
                    loggedInUser.getId(),
                    loggedInUser.getEmail(),
                    loggedInUser.getRole() != null ? loggedInUser.getRole() : "CUSTOMER"
            );

            // Return both token and user info (for frontend to cache user display data)
            return ResponseEntity.ok(new AuthResponse(
                    token,
                    loggedInUser.getId(),
                    loggedInUser.getFullName(),
                    loggedInUser.getEmail(),
                    loggedInUser.getPhone(),
                    loggedInUser.getRole(),
                    loggedInUser.getDistrict(),
                    loggedInUser.getAddressLine(),
                    loggedInUser.getLandmark(),
                    loggedInUser.getTown(),
                    loggedInUser.getAreaType()
            ));
        } catch (DataAccessException e) {
            return ResponseEntity.status(503).body("Database connection failed. Please check MySQL username and password.");
        }
    }
}
