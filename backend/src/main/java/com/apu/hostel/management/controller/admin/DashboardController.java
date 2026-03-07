package com.apu.hostel.management.controller.admin;

import com.apu.hostel.management.model.MyUsers;
import com.apu.hostel.management.repository.ResidentRepository;
import com.apu.hostel.management.repository.SecurityStaffRepository;
import com.apu.hostel.management.repository.VerifiedVisitorsRepository;
import com.apu.hostel.management.repository.UserRepository;
import com.apu.hostel.management.repository.VisitRequestRepository;
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

    @Autowired
    private VisitRequestRepository visitRequestRepository;

    @Autowired
    private com.apu.hostel.management.security.SecurityUtils securityUtils;

    private Long getAdminPropertyId() {
        Long userId = securityUtils.getUserId();
        if (userId != null) {
            return userRepository.findById(userId)
                    .map(MyUsers::getPropertyId)
                    .orElse(null);
        }
        return null;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        Long propertyId = getAdminPropertyId();
        Map<String, Object> stats = new HashMap<>();

        // Total counts
        stats.put("totalResidents", residentRepository.countByPropertyId(propertyId));
        stats.put("totalStaff", securityStaffRepository.countByPropertyId(propertyId));

        // Actionable & Operational
        stats.put("pendingVisits", visitRequestRepository.countByStatus("Pending")); // Track requests needing attention

        String today = java.time.LocalDate.now().toString();
        stats.put("todayVisitors", visitRequestRepository.countByResidentPropertyIdAndVisitDate(propertyId, today));

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
