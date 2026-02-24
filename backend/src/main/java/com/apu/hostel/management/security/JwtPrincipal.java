package com.apu.hostel.management.security;

/**
 * Carries the authenticated user's identity extracted from the JWT.
 * This is set as the "principal" in the Spring SecurityContext.
 * Controllers call
 * SecurityContextHolder.getContext().getAuthentication().getPrincipal()
 * and cast to JwtPrincipal to get userId and email without trusting the request
 * body.
 */
public class JwtPrincipal {

    private final Long userId;
    private final String email;

    public JwtPrincipal(Long userId, String email) {
        this.userId = userId;
        this.email = email;
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public String toString() {
        return "JwtPrincipal{userId=" + userId + ", email='" + email + "'}";
    }
}
