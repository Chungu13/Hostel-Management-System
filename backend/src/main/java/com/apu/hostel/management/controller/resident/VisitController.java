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
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/visits")
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
    public ResponseEntity<Page<VisitRequest>> getAdminHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (!securityUtils.isManagingStaff()) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(visitService.getAllHistoryAdmin(PageRequest.of(page, size)));
    }

    @GetMapping("/resident/{id}")
    public ResponseEntity<?> getResidentVisits(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            return ResponseEntity.status(401).body("Not authenticated");

        // Authorization logic
        boolean isOwner = currentUserId.equals(id);
        boolean isStaff = securityUtils.isManagingStaff() || securityUtils.isSecurityStaff();

        MyUsers targetUser = userRepository.findById(id).orElse(null);
        if (targetUser == null)
            return ResponseEntity.notFound().build();

        MyUsers currentUser = userRepository.findById(currentUserId).orElse(null);
        boolean sameProperty = currentUser != null && targetUser.getPropertyId() != null
                && targetUser.getPropertyId().equals(currentUser.getPropertyId());

        // Only owner OR (Staff AND same property) can view details
        if (!isOwner && !(isStaff && sameProperty)) {
            return ResponseEntity.status(403).body("Unauthorized to view these visits");
        }

        // Find if user has cleared their history
        java.time.LocalDateTime clearedAt = targetUser.getHistoryClearedAt();
        return ResponseEntity.ok(visitService.getRequestsByResident(id, clearedAt, PageRequest.of(page, size)));
    }

    @PostMapping("/request")
    public ResponseEntity<?> requestVisit(@Valid @RequestBody VisitRequestDTO dto) {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            return ResponseEntity.status(401).body("Not authenticated");

        Long residentId = dto.getResidentId();
        MyUsers residentUser = userRepository.findById(residentId).orElse(null);
        if (residentUser == null) {
            return ResponseEntity.badRequest().body("Resident not found");
        }

        // Security Check: Only residents can create visits, and only for themeselves
        // (unless staff of the same building)
        boolean isOwner = currentUserId.equals(residentId);
        boolean isStaff = securityUtils.isManagingStaff();

        MyUsers currentUser = userRepository.findById(currentUserId).orElse(null);
        boolean sameProperty = currentUser != null && residentUser.getPropertyId() != null
                && residentUser.getPropertyId().equals(currentUser.getPropertyId());

        if (!isOwner && !(isStaff && sameProperty)) {
            return ResponseEntity.status(403).body("Cannot request visit for another user");
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
    public ResponseEntity<?> updateVisitStatus(@RequestBody Map<String, Object> payload) {
        Long id = Long.valueOf(payload.get("id").toString());
        String status = payload.get("status").toString();

        // Check ownership/role before updating
        return visitRequestRepository.findById(id).map(visit -> {
            Long currentUserId = securityUtils.getUserId();
            if (currentUserId == null)
                return ResponseEntity.status(401).build();

            boolean isOwner = visit.getResident() != null && visit.getResident().getId().equals(currentUserId);
            boolean isStaff = securityUtils.isManagingStaff() || securityUtils.isSecurityStaff();

            MyUsers currentUser = userRepository.findById(currentUserId).orElse(null);
            boolean sameProperty = currentUser != null && visit.getResident() != null
                    && visit.getResident().getProperty() != null
                    && visit.getResident().getProperty().getId().equals(currentUser.getPropertyId());

            if (!isOwner && !(isStaff && sameProperty)) {
                return ResponseEntity.status(403).body("Unauthorized to update this visit's status");
            }

            visitService.updateStatus(id, status);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVisit(@PathVariable Long id) {
        return visitRequestRepository.findById(id).map(visit -> {
            Long currentUserId = securityUtils.getUserId();
            boolean isOwner = visit.getResident() != null && visit.getResident().getId().equals(currentUserId);
            boolean isStaff = securityUtils.isManagingStaff();

            if (!isOwner && !isStaff) {
                return ResponseEntity.status(403).body("Unauthorized to delete this visit");
            }

            visitService.deleteVisit(id);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/public/pass/{code}")
    public ResponseEntity<VisitRequest> getPublicVisitPass(@PathVariable String code) {
        return visitRequestRepository.findByVisitCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
