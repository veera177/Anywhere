package com.app.start_app.security;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** JWT is the only source of a customer identity for protected operations. */
public final class CurrentUser {
    private CurrentUser() { }
    public static Integer require(Integer userId) {
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        return userId;
    }
    public static void owns(Integer authenticatedUserId, Integer resourceUserId) {
        if (!require(authenticatedUserId).equals(resourceUserId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this resource");
    }
}
