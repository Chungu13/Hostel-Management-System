package com.apu.hostel.management.controller.security;

import com.apu.hostel.management.service.SecurityService;
import com.apu.hostel.management.security.JwtPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/security")
public class SecurityController {

    @Autowired
    private SecurityService securityService;

    @GetMapping("/history")
    public ResponseEntity<?> getVerificationHistory() {
        return ResponseEntity.ok(securityService.getVerificationHistory());
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(securityService.getDashboardStats());
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyVisitor(@RequestBody Map<String, String> data) {
        try {
            JwtPrincipal principal = getAuthenticatedPrincipal();
            Long staffId = (principal != null) ? principal.getUserId() : 1L; // Fallback to 1L for now if not fully
                                                                             // secured

            Optional<com.apu.hostel.management.model.VisitRequest> visitOpt = securityService
                    .getVisitByCode(data.get("visitCode"));
            boolean verified = securityService.verifyVisitor(staffId, data.get("visitCode"));

            if (verified && visitOpt.isPresent()) {
                com.apu.hostel.management.model.VisitRequest v = visitOpt.get();
                return ResponseEntity.ok(Map.of(
                        "message", "Visitor verified successfully",
                        "verified", true,
                        "visitorName", v.getVisitorName(),
                        "residentName", v.getResidentName(),
                        "residentId", v.getResident() != null ? v.getResident().getId() : null,
                        "visitDate", v.getVisitDate() != null ? v.getVisitDate() : "",
                        "visitTime", v.getVisitTime() != null ? v.getVisitTime() : ""));
            } else {
                return ResponseEntity.status(401)
                        .body(Map.of("message", "Invalid or already used code", "verified", false));
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
            securityService.logVisitorDetailsByCode(
                    data.get("visitCode"),
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

    @PostMapping("/duty/toggle")
    public ResponseEntity<?> toggleDutyStatus() {
        JwtPrincipal principal = getAuthenticatedPrincipal();
        if (principal == null)
            return ResponseEntity.status(401).body("Not authenticated");
        boolean onDuty = securityService.toggleDutyStatus(principal.getUserId());
        return ResponseEntity.ok(Map.of("onDuty", onDuty));
    }

    @GetMapping("/duty/status")
    public ResponseEntity<?> getDutyStatus() {
        JwtPrincipal principal = getAuthenticatedPrincipal();
        if (principal == null)
            return ResponseEntity.status(401).body("Not authenticated");
        var staff = securityService.getStaffById(principal.getUserId());
        return ResponseEntity.ok(Map.of("onDuty", staff != null && staff.isOnDuty()));
    }

    @GetMapping("/on-duty/{propertyId}")
    public ResponseEntity<?> getOnDutyByProperty(@PathVariable Long propertyId) {
        return ResponseEntity.ok(securityService.getOnDutyStaff(propertyId));
    }
}
