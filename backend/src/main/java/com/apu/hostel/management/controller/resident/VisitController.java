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

    @GetMapping("/history")
    public List<VisitRequest> getAllVisits() {
        return visitRequestRepository.findAll();
    }

    @GetMapping("/history/{id}")
    public List<VisitRequest> getResidentVisits(@PathVariable Long id) {
        return visitRequestRepository.findByResidentId(id);
    }

    @PostMapping("/request")
    public ResponseEntity<?> requestVisit(@RequestBody Map<String, String> data) {
        try {
            visitService.createVisitRequest(
                    Long.valueOf(data.get("residentId")),
                    data.get("residentName"),
                    data.get("visitorName"),
                    data.get("visitorUsername"),
                    data.get("visitorPassword"));
            return ResponseEntity.ok(Map.of("message", "Visit request created successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
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
}
