package com.apu.hostel.management.controller;

import com.apu.hostel.management.service.ReportingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/reports")
public class ReportController {

    @Autowired
    private ReportingService reportingService;

    @GetMapping("/residents")
    public String residentReports(Model model) {
        model.addAttribute("genderReport", reportingService.getResidentGenderReport());
        model.addAttribute("approvalReport", reportingService.getResidentApprovalReport());
        model.addAttribute("totalResidents", reportingService.getTotalResidents());

        return "viewResidentReports";
    }

    @GetMapping("/security")
    public String securityReports(Model model) {
        model.addAttribute("genderReport", reportingService.getSecurityGenderReport());
        model.addAttribute("totalSecurity", reportingService.getTotalSecurityStaff());

        return "viewSecurityReports";
    }
}
