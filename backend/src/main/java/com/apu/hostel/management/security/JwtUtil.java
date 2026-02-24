package com.apu.hostel.management.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Utility for generating and validating JWT tokens.
 * Tokens embed: userId (sub), email, role.
 * Signed with HS256 using a secret from application config.
 */
@Component
public class JwtUtil {

    private static final long EXPIRY_MS = 7L * 24 * 60 * 60 * 1000; // 7 days

    @Value("${jwt.secret}")
    private String jwtSecret;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /** Generate a signed JWT containing userId, email, and role. */
    public String generateToken(Long userId, String email, String role) {
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRY_MS))
                .signWith(signingKey())
                .compact();
    }

    /**
     * Parse and return all claims from a valid token. Throws JwtException if
     * invalid/expired.
     */
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /** Extract the userId (stored as the JWT subject). */
    public Long extractUserId(String token) {
        return Long.parseLong(extractAllClaims(token).getSubject());
    }

    /** Extract the email claim. */
    public String extractEmail(String token) {
        return extractAllClaims(token).get("email", String.class);
    }

    /** Extract the role claim. */
    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    /** Returns true if the token parses without throwing. */
    public boolean isTokenValid(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
