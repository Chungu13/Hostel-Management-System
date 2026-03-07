package com.apu.hostel.management.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    /**
     * Get the authenticated principal from the security context.
     * 
     * @return JwtPrincipal or null if not authenticated.
     */
    public JwtPrincipal getPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof JwtPrincipal principal) {
            return principal;
        }
        return null;
    }

    /**
     * Get the authenticated user's ID.
     * 
     * @return user ID or null if not authenticated.
     */
    public Long getUserId() {
        JwtPrincipal principal = getPrincipal();
        return (principal != null) ? principal.getUserId() : null;
    }

    /**
     * Check if the current user has a specific role.
     * 
     * @param role The role name (without ROLE_ prefix unless it was added
     *             manually).
     * @return true if the user has the role.
     */
    public boolean hasRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null)
            return false;

        String roleWithPrefix = role.startsWith("ROLE_") ? role : "ROLE_" + role.replace(" ", "_");
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(roleWithPrefix));
    }

    /**
     * Check if the current user is an admin or managing staff.
     */
    public boolean isManagingStaff() {
        return hasRole("Managing Staff") || hasRole("Admin");
    }

    /**
     * Check if the current user is security staff.
     */
    public boolean isSecurityStaff() {
        return hasRole("Security Staff");
    }

    /**
     * Check if the current user is a resident.
     */
    public boolean isResident() {
        return hasRole("Resident");
    }
}
