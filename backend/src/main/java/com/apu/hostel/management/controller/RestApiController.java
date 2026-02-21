package com.apu.hostel.management.controller;

import com.apu.hostel.management.model.Residents;
import com.apu.hostel.management.model.SecurityStaff;
import com.apu.hostel.management.model.VisitRequest;
import com.apu.hostel.management.repository.ResidentRepository;
import com.apu.hostel.management.repository.SecurityStaffRepository;
import com.apu.hostel.management.repository.VisitRequestRepository;
import com.apu.hostel.management.service.SecurityService;
import com.apu.hostel.management.service.VisitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class RestApiController {

    @Autowired
    private VisitService visitService;

    @Autowired
    private SecurityService securityService;

    @Autowired
    private ResidentRepository residentRepository;

    @Autowired
    private SecurityStaffRepository securityStaffRepository;

    @Autowired
    private VisitRequestRepository visitRequestRepository;

    @GetMapping("/visits/history")
    public List<VisitRequest> getAllVisits() {
        return visitRequestRepository.findAll();
    }

    @GetMapping("/visits/history/{username}")
    public List<VisitRequest> getResidentVisits(@PathVariable String username) {
        return visitRequestRepository.findByResidentUsername(username);
    }

    // --- Profile Endpoints ---
    @GetMapping("/profile/{username}")
    public ResponseEntity<?> getProfile(@PathVariable String username) {
        Optional<Residents> resident = residentRepository.findByUsername(username);
        if (resident.isPresent())
            return ResponseEntity.ok(resident.get());

        Optional<SecurityStaff> staff = securityStaffRepository.findByUsername(username);
        if (staff.isPresent())
            return ResponseEntity.ok(staff.get());

        return ResponseEntity.notFound().build();
    }

    @PutMapping("/profile/{username}")
    public ResponseEntity<?> updateProfile(@PathVariable String username, @RequestBody Map<String, String> data) {
        Optional<Residents> residentOpt = residentRepository.findByUsername(username);
        if (residentOpt.isPresent()) {
            Residents res = residentOpt.get();
            res.setName(data.get("name"));
            res.setEmail(data.get("email"));
            res.setPhone(data.get("phone"));
            res.setAddress(data.get("address"));
            residentRepository.save(res);
            return ResponseEntity.ok(res);
        }

        Optional<SecurityStaff> staffOpt = securityStaffRepository.findByUsername(username);
        if (staffOpt.isPresent()) {
            SecurityStaff staff = staffOpt.get();
            staff.setName(data.get("name"));
            staff.setEmail(data.get("email"));
            staff.setPhone(data.get("phone"));
            staff.setAddress(data.get("address"));
            securityStaffRepository.save(staff);
            return ResponseEntity.ok(staff);
        }

        return ResponseEntity.notFound().build();
    }

    // --- Visit Endpoints ---
    @PostMapping("/visits/request")
    public ResponseEntity<?> requestVisit(@RequestBody Map<String, String> data) {
        visitService.createVisitRequest(
                data.get("residentUsername"),
                data.get("visitorName"),
                data.get("visitorName"), // Assuming visitorName as name for now
                data.get("visitorUsername"),
                data.get("visitorPassword"));
        return ResponseEntity.ok(Map.of("message", "Visit request created"));
    }

    @PostMapping("/security/verify")
    public ResponseEntity<?> verifyVisitor(@RequestBody Map<String, String> data) {
        try {
            boolean verified = securityService.verifyVisitor(
                    "SYSTEM", // Context of security staff usually comes from auth, using SYSTEM for now
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

    @PostMapping("/security/log-details")
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
