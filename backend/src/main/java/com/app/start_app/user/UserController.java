package com.app.start_app.user;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserDAO userDAO;

    public UserController(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    // REGISTER
    @PostMapping("/register")
    public String register(@RequestBody User user) {

        int result = userDAO.registerUser(user);

        if (result > 0) {
            return "Registration Successful";
        }

        return "Registration Failed";
    }

    // LOGIN
    @PostMapping("/login")
    public User login(@RequestBody User user) {

        return userDAO.loginUser(
                user.getEmail(),
                user.getPassword()
        );
    }
}