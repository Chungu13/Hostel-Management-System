package com.apu.hostel.management.controller.admin;

import com.apu.hostel.management.service.ReportingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportingService reportingService;

    @GetMapping("/residents")
    public Map<String, Object> residentReports() {
        return Map.of(
                "genderReport", reportingService.getResidentGenderReport(),
                "approvalReport", reportingService.getResidentApprovalReport(),
                "totalResidents", reportingService.getTotalResidents());
    }

    @GetMapping("/security")
    public Map<String, Object> securityReports() {
        return Map.of(
                "genderReport", reportingService.getSecurityGenderReport(),
                "totalSecurity", reportingService.getTotalSecurityStaff());
    }
}
