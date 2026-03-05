package com.apu.hostel.management.controller.resident;

import com.apu.hostel.management.model.VisitRequest;
import com.apu.hostel.management.repository.VisitRequestRepository;
import com.apu.hostel.management.service.VisitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/visits")
public class VisitController {

    @Autowired
    private VisitService visitService;

    @Autowired
    private VisitRequestRepository visitRequestRepository;

    @Autowired
    private com.apu.hostel.management.repository.UserRepository userRepository;

    private com.apu.hostel.management.security.JwtPrincipal getPrincipal() {
        Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        if (principal instanceof com.apu.hostel.management.security.JwtPrincipal jp) {
            return jp;
        }
        return null;
    }

    private java.time.LocalDateTime getUserClearedAt(Long userId) {
        return userRepository.findById(userId)
                .map(com.apu.hostel.management.model.MyUsers::getHistoryClearedAt)
                .orElse(null);
    }

    @GetMapping("/history")
    public List<VisitRequest> getAllVisits() {
        com.apu.hostel.management.security.JwtPrincipal principal = getPrincipal();
        java.time.LocalDateTime clearedAt = principal != null ? getUserClearedAt(principal.getUserId()) : null;
        return visitService.getHistory(clearedAt);
    }

    @GetMapping("/resident/{id}")
    public List<VisitRequest> getResidentVisits(@PathVariable Long id) {
        com.apu.hostel.management.security.JwtPrincipal principal = getPrincipal();
        java.time.LocalDateTime clearedAt = principal != null ? getUserClearedAt(principal.getUserId()) : null;
        return visitService.getRequestsByResident(id, clearedAt);
    }

    @GetMapping("/admin/history")
    public List<VisitRequest> getAdminHistory() {
        return visitService.getAllHistoryAdmin();
    }

    @GetMapping("/public/pass/{visitCode}")
    public ResponseEntity<?> getPublicVisitPass(@PathVariable String visitCode) {
        return visitRequestRepository.findByVisitCode(visitCode)
                .map(v -> ResponseEntity.ok(Map.of(
                        "residentName", v.getResidentName(),
                        "visitorName", v.getVisitorName(),
                        "visitDate", v.getVisitDate(),
                        "visitTime", v.getVisitTime(),
                        "purpose", v.getPurpose(),
                        "status", v.getStatus(),
                        "visitCode", v.getVisitCode())))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/request")
    public ResponseEntity<?> requestVisit(@RequestBody Map<String, Object> data) {
        try {
            Object residentIdObj = data.get("residentId");
            if (residentIdObj == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "residentId is required"));
            }

            Long residentId = Long.valueOf(residentIdObj.toString());
            String residentName = (String) data.get("residentName");
            String visitorName = (String) data.get("visitorName");
            String visitDate = (String) data.get("visitDate");
            String visitTime = (String) data.get("visitTime");
            String purpose = (String) data.get("purpose");

            VisitRequest created = visitService.createVisitRequest(
                    residentId,
                    residentName,
                    visitorName,
                    visitDate,
                    visitTime,
                    purpose);

            return ResponseEntity.ok(Map.of(
                    "id", created.getId(),
                    "visitCode", created.getVisitCode(),
                    "status", created.getStatus()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Unknown error occurred"));
        }
    }

    @PostMapping("/status")
    public ResponseEntity<?> updateVisitStatus(@RequestBody Map<String, Object> data) {
        try {
            Long id = Long.valueOf(data.get("id").toString());
            String status = data.get("status").toString();
            visitService.updateStatus(id, status);
            return ResponseEntity.ok(Map.of("message", "Request status updated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVisit(@PathVariable Long id) {
        try {
            visitService.deleteVisit(id);
            return ResponseEntity.ok(Map.of("message", "Visit request deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
