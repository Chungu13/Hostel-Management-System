package com.apu.hostel.management.controller.admin;

import com.apu.hostel.management.model.MyUsers;
import com.apu.hostel.management.repository.ResidentRepository;
import com.apu.hostel.management.repository.SecurityStaffRepository;
import com.apu.hostel.management.repository.VerifiedVisitorsRepository;
import com.apu.hostel.management.repository.UserRepository;
import com.apu.hostel.management.security.JwtPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private ResidentRepository residentRepository;

    @Autowired
    private SecurityStaffRepository securityStaffRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VerifiedVisitorsRepository verifiedVisitorsRepository;

    private Long getAdminPropertyId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof JwtPrincipal principal) {
            return userRepository.findById(principal.getUserId())
                    .map(MyUsers::getPropertyId)
                    .orElseThrow(() -> new IllegalStateException("Admin profile not found"));
        }
        throw new IllegalStateException("Authentication context missing or invalid admin profile.");
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        Long propertyId = getAdminPropertyId();
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalResidents", residentRepository.countByPropertyId(propertyId));
        stats.put("totalStaff", securityStaffRepository.countByPropertyId(propertyId));
        stats.put("recentActivity", verifiedVisitorsRepository.findFirst5ByOrderByIdDesc());

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/gender-distribution")
    public ResponseEntity<?> getGenderDistribution() {
        Long propertyId = getAdminPropertyId();

        long male = residentRepository.findByPropertyId(propertyId).stream()
                .filter(r -> "Male".equalsIgnoreCase(r.getGender())).count();
        long female = residentRepository.findByPropertyId(propertyId).stream()
                .filter(r -> "Female".equalsIgnoreCase(r.getGender())).count();

        return ResponseEntity.ok(List.of(
                Map.of("name", "Male", "value", male),
                Map.of("name", "Female", "value", female)));
    }
}
