package com.apu.hostel.management.controller.admin;

import com.apu.hostel.management.model.MyUsers;
import com.apu.hostel.management.repository.UserRepository;
import com.apu.hostel.management.security.JwtPrincipal;
import com.apu.hostel.management.service.ReportingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportingService reportingService;

    @Autowired
    private UserRepository userRepository;

    private Long getAdminPropertyId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof JwtPrincipal principal) {
            return userRepository.findById(principal.getUserId())
                    .map(MyUsers::getPropertyId)
                    .orElseThrow(() -> new IllegalStateException("Admin profile not found"));
        }
        throw new IllegalStateException("Authentication context missing or invalid admin profile.");
    }

    @GetMapping("/residents")
    public Map<String, Object> residentReports() {
        Long propertyId = getAdminPropertyId();
        return Map.of(
                "genderReport", reportingService.getResidentGenderReport(propertyId),
                "approvalReport", reportingService.getResidentApprovalReport(propertyId),
                "totalResidents", reportingService.getTotalResidents(propertyId));
    }

    @GetMapping("/security")
    public Map<String, Object> securityReports() {
        Long propertyId = getAdminPropertyId();
        return Map.of(
                "genderReport", reportingService.getSecurityGenderReport(propertyId),
                "totalSecurity", reportingService.getTotalSecurityStaff(propertyId));
    }
}
