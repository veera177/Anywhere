package com.app.start_app.user;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserProfileController {

    private final UserDAO userDAO;

    public UserProfileController(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<User> getProfile(@PathVariable Integer id) {

        User user = userDAO.getUserById(id);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<User> updateProfile(
            @PathVariable Integer id,
            @RequestBody User user
    ) {

        int result = userDAO.updateProfile(id, user);

        if (result == 0) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        User updatedUser = userDAO.getUserById(id);

        return ResponseEntity.ok(updatedUser);
    }
}
