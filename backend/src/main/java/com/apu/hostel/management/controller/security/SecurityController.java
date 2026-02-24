package com.apu.hostel.management.controller.security;

import com.apu.hostel.management.service.SecurityService;
import com.apu.hostel.management.security.JwtPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/security")
public class SecurityController {

    @Autowired
    private SecurityService securityService;

    @GetMapping("/history")
    public ResponseEntity<?> getVerificationHistory() {
        return ResponseEntity.ok(securityService.getVerificationHistory());
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyVisitor(@RequestBody Map<String, String> data) {
        try {
            JwtPrincipal principal = getAuthenticatedPrincipal();
            Long staffId = (principal != null) ? principal.getUserId() : 1L; // Fallback to 1L for now if not fully
                                                                             // secured

            boolean verified = securityService.verifyVisitor(
                    staffId,
                    data.get("residentName"),
                    data.get("visitorUsername"),
                    data.get("password"));
            if (verified) {
                return ResponseEntity.ok(Map.of("message", "Visitor verified successfully", "verified", true));
            } else {
                return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials", "verified", false));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private JwtPrincipal getAuthenticatedPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof JwtPrincipal principal) {
            return principal;
        }
        return null;
    }

    @PostMapping("/log-details")
    public ResponseEntity<?> logDetails(@RequestBody Map<String, String> data) {
        try {
            securityService.logVisitorDetailsByUsername(
                    data.get("visitorUsername"),
                    data.get("name"),
                    data.get("email"),
                    data.get("phone"),
                    data.get("ic"),
                    data.get("gender"),
                    data.get("address"));
            return ResponseEntity.ok(Map.of("message", "Visitor details logged successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
