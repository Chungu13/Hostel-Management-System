package com.apu.hostel.management.controller.security;

import com.apu.hostel.management.service.SecurityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import java.util.Map;
import java.util.Optional;
import com.apu.hostel.management.model.MyUsers;
import com.apu.hostel.management.model.VerifiedVisitors;

@RestController
@RequestMapping("/api/security")
@Tag(name = "Security", description = "Endpoints for security staff: verifying visitors and duty management")
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
    @Operation(summary = "Get verification history", description = "IDOR protected: Only security/management of the same property.")
    public ResponseEntity<Page<VerifiedVisitors>> getVerificationHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            throw new AccessDeniedException("Not authenticated");

        if (!securityUtils.isSecurityStaff() && !securityUtils.isManagingStaff()) {
            throw new AccessDeniedException("Security access required");
        }

        MyUsers user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getPropertyId() == null) {
            throw new IllegalArgumentException("User not linked to a property");
        }

        java.time.LocalDateTime clearedAt = getUserClearedAt(currentUserId);
        return ResponseEntity.ok(
                securityService.getVerificationHistory(user.getPropertyId(), clearedAt, PageRequest.of(page, size)));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get security dashboard stats")
    public ResponseEntity<?> getStats() {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            throw new AccessDeniedException("Not authenticated");

        if (!securityUtils.isSecurityStaff() && !securityUtils.isManagingStaff()) {
            throw new AccessDeniedException("Security access required");
        }

        MyUsers user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getPropertyId() == null) {
            throw new IllegalArgumentException("User not linked to a property");
        }

        java.time.LocalDateTime clearedAt = getUserClearedAt(currentUserId);
        return ResponseEntity.ok(securityService.getDashboardStats(user.getPropertyId(), clearedAt));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify visitor code")
    public ResponseEntity<?> verifyVisitor(@RequestBody Map<String, String> data) {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            throw new AccessDeniedException("Not authenticated");

        if (!securityUtils.isSecurityStaff() && !securityUtils.isManagingStaff()) {
            throw new AccessDeniedException("Security access required");
        }

        String visitCode = data.get("visitCode");
        if (visitCode == null || visitCode.isBlank()) {
            throw new IllegalArgumentException("Visit code is required");
        }

        Optional<com.apu.hostel.management.model.VisitRequest> visitOpt = securityService.getVisitByCode(visitCode);
        boolean verified = securityService.verifyVisitor(currentUserId, visitCode);

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
            throw new IllegalArgumentException("Invalid or already used code");
        }
    }

    @PostMapping("/log-details")
    @Operation(summary = "Log visitor details after verification")
    public ResponseEntity<?> logDetails(@RequestBody Map<String, String> data) {
        securityService.logVisitorDetailsByCode(
                data.get("visitCode"),
                data.get("name"),
                data.get("email"),
                data.get("phone"),
                data.get("ic"),
                data.get("gender"),
                data.get("address"));
        return ResponseEntity.ok(Map.of("message", "Visitor details logged successfully"));
    }

    @PostMapping("/duty/toggle")
    @Operation(summary = "Toggle duty status (Security Staff only)")
    public ResponseEntity<?> toggleDutyStatus() {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            throw new AccessDeniedException("Not authenticated");

        if (!securityUtils.isSecurityStaff()) {
            throw new AccessDeniedException("Only Security Staff can toggle duty");
        }

        boolean onDuty = securityService.toggleDutyStatus(currentUserId);
        return ResponseEntity.ok(Map.of("onDuty", onDuty));
    }

    @GetMapping("/duty/status")
    @Operation(summary = "Get current duty status")
    public ResponseEntity<?> getDutyStatus() {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            throw new AccessDeniedException("Not authenticated");

        var staff = securityService.getStaffById(currentUserId);
        return ResponseEntity.ok(Map.of("onDuty", staff != null && staff.isOnDuty()));
    }

    @GetMapping("/on-duty/{propertyId}")
    @Operation(summary = "Get lists of staff on duty for a property")
    public ResponseEntity<?> getOnDutyByProperty(@PathVariable Long propertyId) {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            throw new AccessDeniedException("Not authenticated");

        MyUsers currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!propertyId.equals(currentUser.getPropertyId()) && !securityUtils.isManagingStaff()) {
            throw new AccessDeniedException("Unauthorized for this property");
        }

        return ResponseEntity.ok(securityService.getOnDutyStaff(propertyId));
    }
}
