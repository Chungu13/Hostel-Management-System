package com.apu.hostel.management.controller;

import com.apu.hostel.management.repository.ResidentRepository;
import com.apu.hostel.management.repository.SecurityStaffRepository;
import com.apu.hostel.management.repository.VisitRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class RestDashboardController {

    @Autowired
    private ResidentRepository residentRepository;

    @Autowired
    private SecurityStaffRepository securityStaffRepository;

    @Autowired
    private VisitRequestRepository visitRequestRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalResidents", residentRepository.count());
        stats.put("totalStaff", securityStaffRepository.count());
        stats.put("pendingVisits", visitRequestRepository.findAll().stream()
                .filter(v -> "Pending".equalsIgnoreCase(v.getStatus()))
                .count());

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/gender-distribution")
    public ResponseEntity<?> getGenderDistribution() {
        long male = residentRepository.findAll().stream().filter(r -> "Male".equalsIgnoreCase(r.getGender())).count();
        long female = residentRepository.findAll().stream().filter(r -> "Female".equalsIgnoreCase(r.getGender()))
                .count();

        return ResponseEntity.ok(List.of(
                Map.of("name", "Male", "value", male),
                Map.of("name", "Female", "value", female)));
    }
}
