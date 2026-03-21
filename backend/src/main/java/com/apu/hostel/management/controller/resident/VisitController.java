package com.apu.hostel.management.controller.resident;

import com.apu.hostel.management.dto.VisitRequestDTO;
import com.apu.hostel.management.model.MyUsers;
import com.apu.hostel.management.model.VisitRequest;
import com.apu.hostel.management.service.VisitService;
import com.apu.hostel.management.repository.VisitRequestRepository;
import com.apu.hostel.management.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/visits")
@Tag(name = "Visits", description = "Endpoints for managing visitor requests and passes")
public class VisitController {

    @Autowired
    private VisitService visitService;

    @Autowired
    private VisitRequestRepository visitRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.apu.hostel.management.security.SecurityUtils securityUtils;

    @GetMapping("/admin/history")
    @Operation(summary = "Get all visit history (Admin)", description = "Returns a paginated list of all visit requests for the admin portal.")
    public ResponseEntity<Page<VisitRequest>> getAdminHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (!securityUtils.isManagingStaff()) {
            throw new AccessDeniedException("Unauthorized to view admin history");
        }
        return ResponseEntity.ok(visitService.getAllHistoryAdmin(PageRequest.of(page, size)));
    }

    @GetMapping("/history")
    @Operation(summary = "Get system visit history", description = "Returns a list of all visit requests.")
    public ResponseEntity<?> getSystemHistory() {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            throw new AccessDeniedException("Not authenticated");

        // Allow Admin or Security Staff to view history
        if (!securityUtils.isManagingStaff() && !securityUtils.isSecurityStaff()) {
            throw new AccessDeniedException("Unauthorized to view system history");
        }

        java.time.LocalDateTime clearedAt = userRepository.findById(currentUserId)
                .map(MyUsers::getHistoryClearedAt).orElse(null);

        return ResponseEntity.ok(visitService.getHistory(clearedAt));
    }

    @GetMapping("/resident/{id}")
    @Operation(summary = "Get visit history for a resident", description = "Returns paginated visits for a specific resident. IDOR protected: Only owner or staff of same property can view.")
    public ResponseEntity<?> getResidentVisits(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            throw new AccessDeniedException("Not authenticated");

        MyUsers targetUser = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resident not found"));

        // IDOR Protection
        boolean isOwner = currentUserId.equals(id);
        boolean isStaff = securityUtils.isManagingStaff() || securityUtils.isSecurityStaff();

        MyUsers currentUser = userRepository.findById(currentUserId).orElse(null);
        boolean sameProperty = currentUser != null && targetUser.getPropertyId() != null
                && targetUser.getPropertyId().equals(currentUser.getPropertyId());

        if (!isOwner && !(isStaff && sameProperty)) {
            throw new AccessDeniedException("Unauthorized to view these visits");
        }

        java.time.LocalDateTime clearedAt = targetUser.getHistoryClearedAt();
        return ResponseEntity.ok(visitService.getRequestsByResident(id, clearedAt, PageRequest.of(page, size)));
    }

    @PostMapping("/request")
    @Operation(summary = "Create a new visit request", description = "Allows a resident to request a visitor pass. IDOR protected: Only for self unless admin.")
    public ResponseEntity<?> requestVisit(@Valid @RequestBody VisitRequestDTO dto) {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            throw new AccessDeniedException("Not authenticated");

        Long residentId = dto.getResidentId();
        MyUsers residentUser = userRepository.findById(residentId)
                .orElseThrow(() -> new IllegalArgumentException("Resident not found"));

        // IDOR Protection
        boolean isOwner = currentUserId.equals(residentId);
        boolean isStaff = securityUtils.isManagingStaff();

        MyUsers currentUser = userRepository.findById(currentUserId).orElse(null);
        boolean sameProperty = currentUser != null && residentUser.getPropertyId() != null
                && residentUser.getPropertyId().equals(currentUser.getPropertyId());

        if (!isOwner && !(isStaff && sameProperty)) {
            throw new AccessDeniedException("Unauthorized: Cannot request visit for another user");
        }

        VisitRequest created = visitService.createVisitRequest(
                residentId,
                dto.getResidentName(),
                dto.getVisitorName(),
                dto.getVisitDate(),
                dto.getVisitTime(),
                dto.getPurpose());
        return ResponseEntity.ok(created);
    }

    @PostMapping("/status")
    @Operation(summary = "Update visit status", description = "IDOR protected: Only owner or staff of same property can update.")
    public ResponseEntity<?> updateVisitStatus(@RequestBody Map<String, Object> payload) {
        Long id = Long.valueOf(payload.get("id").toString());
        String status = payload.get("status").toString();

        VisitRequest visit = visitRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Visit request not found"));

        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            throw new AccessDeniedException("Not authenticated");

        // IDOR Protection
        boolean isOwner = visit.getResident() != null && visit.getResident().getId().equals(currentUserId);
        boolean isStaff = securityUtils.isManagingStaff() || securityUtils.isSecurityStaff();

        MyUsers currentUser = userRepository.findById(currentUserId).orElse(null);
        boolean sameProperty = currentUser != null && visit.getResident() != null
                && visit.getResident().getProperty() != null
                && visit.getResident().getProperty().getId().equals(currentUser.getPropertyId());

        if (!isOwner && !(isStaff && sameProperty)) {
            throw new AccessDeniedException("Unauthorized to update this visit's status");
        }

        visitService.updateStatus(id, status);
        return ResponseEntity.ok(Map.of("message", "Status updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a visit request", description = "IDOR protected: Only owner or manager can delete.")
    public ResponseEntity<?> deleteVisit(@PathVariable Long id) {
        VisitRequest visit = visitRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Visit request not found"));

        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            throw new AccessDeniedException("Not authenticated");

        boolean isOwner = visit.getResident() != null && visit.getResident().getId().equals(currentUserId);
        boolean isStaff = securityUtils.isManagingStaff();

        if (!isOwner && !isStaff) {
            throw new AccessDeniedException("Unauthorized to delete this visit");
        }

        visitService.deleteVisit(id);
        return ResponseEntity.ok(Map.of("message", "Visit deleted successfully"));
    }

    @GetMapping("/public/pass/{code}")
    @Operation(summary = "Public pass access", description = "Returns visit details by unique code. Used by visitors.")
    public ResponseEntity<VisitRequest> getPublicVisitPass(@PathVariable String code) {
        return visitRequestRepository.findByVisitCode(code)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new IllegalArgumentException("Invalid visit code"));
    }
}
