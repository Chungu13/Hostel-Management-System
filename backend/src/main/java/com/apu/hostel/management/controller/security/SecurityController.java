package com.apu.hostel.management.controller.security;

import com.apu.hostel.management.service.SecurityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import java.util.Map;
import java.util.Optional;
import com.apu.hostel.management.model.MyUsers;
import com.apu.hostel.management.model.VerifiedVisitors;

@RestController
@RequestMapping("/api/security")
public class SecurityController {

    @Autowired
    private SecurityService securityService;

    @Autowired
    private com.apu.hostel.management.repository.UserRepository userRepository;

    @Autowired
    private com.apu.hostel.management.security.SecurityUtils securityUtils;

    private java.time.LocalDateTime getUserClearedAt(Long userId) {
        return userRepository.findById(userId)
                .map(com.apu.hostel.management.model.MyUsers::getHistoryClearedAt)
                .orElse(null);
    }

    @GetMapping("/history")
    public ResponseEntity<Page<VerifiedVisitors>> getVerificationHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            return ResponseEntity.status(401).build();

        if (!securityUtils.isSecurityStaff() && !securityUtils.isManagingStaff()) {
            return ResponseEntity.status(403).build();
        }

        MyUsers user = userRepository.findById(currentUserId).orElse(null);
        if (user == null || user.getPropertyId() == null) {
            return ResponseEntity.status(400).build();
        }

        java.time.LocalDateTime clearedAt = getUserClearedAt(currentUserId);
        return ResponseEntity.ok(
                securityService.getVerificationHistory(user.getPropertyId(), clearedAt, PageRequest.of(page, size)));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            return ResponseEntity.status(401).body("Not authenticated");

        if (!securityUtils.isSecurityStaff() && !securityUtils.isManagingStaff()) {
            return ResponseEntity.status(403).body("Unauthorized: Security access required");
        }

        MyUsers user = userRepository.findById(currentUserId).orElse(null);
        if (user == null || user.getPropertyId() == null) {
            return ResponseEntity.status(400).body("User not linked to a property");
        }

        java.time.LocalDateTime clearedAt = getUserClearedAt(currentUserId);
        return ResponseEntity.ok(securityService.getDashboardStats(user.getPropertyId(), clearedAt));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyVisitor(@RequestBody Map<String, String> data) {
        try {
            Long currentUserId = securityUtils.getUserId();
            if (currentUserId == null)
                return ResponseEntity.status(401).body("Not authenticated");

            if (!securityUtils.isSecurityStaff() && !securityUtils.isManagingStaff()) {
                return ResponseEntity.status(403).body("Unauthorized: Security access required");
            }

            Optional<com.apu.hostel.management.model.VisitRequest> visitOpt = securityService
                    .getVisitByCode(data.get("visitCode"));
            boolean verified = securityService.verifyVisitor(currentUserId, data.get("visitCode"));

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
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            return ResponseEntity.status(401).body("Not authenticated");

        if (!securityUtils.isSecurityStaff()) {
            return ResponseEntity.status(403).body("Unauthorized: Only Security Staff can toggle duty");
        }

        boolean onDuty = securityService.toggleDutyStatus(currentUserId);
        return ResponseEntity.ok(Map.of("onDuty", onDuty));
    }

    @GetMapping("/duty/status")
    public ResponseEntity<?> getDutyStatus() {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            return ResponseEntity.status(401).body("Not authenticated");

        var staff = securityService.getStaffById(currentUserId);
        return ResponseEntity.ok(Map.of("onDuty", staff != null && staff.isOnDuty()));
    }

    @GetMapping("/on-duty/{propertyId}")
    public ResponseEntity<?> getOnDutyByProperty(@PathVariable Long propertyId) {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            return ResponseEntity.status(401).body("Not authenticated");

        // Simple check: Only users linked to this property can see on-duty staff
        return userRepository.findById(currentUserId).map(user -> {
            if (!propertyId.equals(user.getPropertyId()) && !securityUtils.isManagingStaff()) {
                return ResponseEntity.status(403).body("Unauthorized for this property");
            }
            return ResponseEntity.ok(securityService.getOnDutyStaff(propertyId));
        }).orElse(ResponseEntity.notFound().build());
    }
}
