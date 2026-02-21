package com.apu.hostel.management.controller;

import com.apu.hostel.management.model.MyUsers;

import com.apu.hostel.management.service.SecurityService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class SecurityController {

    @Autowired
    private SecurityService securityService;

    @GetMapping("/visitorVerification")
    public String showVerificationForm(HttpSession session, Model model) {
        MyUsers user = (MyUsers) session.getAttribute("user");
        if (user == null || !"Security Staff".equals(user.getMyRole())) {
            return "redirect:/login";
        }
        return "visitorVerification";
    }

    @PostMapping("/visitorVerification")
    public String verifyVisitor(
            @RequestParam String residentName,
            @RequestParam String visitorUsername,
            @RequestParam String password,
            HttpSession session,
            RedirectAttributes redirectAttributes) {

        MyUsers loggedUser = (MyUsers) session.getAttribute("user");
        if (loggedUser == null) {
            return "redirect:/login";
        }

        try {
            boolean verified = securityService.verifyVisitor(loggedUser.getUserName(), residentName, visitorUsername,
                    password);
            if (verified) {
                redirectAttributes.addFlashAttribute("successMessage",
                        "Visitor Verified Successfully! Now please enter their contact details.");
                return "redirect:/visitorDetails?visitorUsername=" + visitorUsername; // requestId will be handled in
                                                                                      // details form
            } else {
                redirectAttributes.addFlashAttribute("errorMessage", "Invalid Verification Details.");
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }

        return "redirect:/visitorVerification";
    }

    @GetMapping("/verifiedVisitorsHistory")
    public String viewHistory(HttpSession session, Model model) {
        MyUsers user = (MyUsers) session.getAttribute("user");
        if (user == null || !"Security Staff".equals(user.getMyRole())) {
            return "redirect:/login";
        }
        model.addAttribute("verifiedVisitorsList", securityService.getVerificationHistory());
        return "viewVerifiedVisitorsHistory";
    }

    @GetMapping("/visitorDetails")
    public String showVisitorDetailsForm(
            @RequestParam String visitorUsername,
            HttpSession session,
            Model model) {

        // Find latest requestId for this visitor to log details
        model.addAttribute("visitorUsername", visitorUsername);
        // We'll trust the latest verification for this username in the service logic
        return "visitorDetails";
    }

    @PostMapping("/visitorDetails")
    public String saveVisitorDetails(
            @RequestParam String visitorUsername,
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String phone,
            @RequestParam String ic,
            @RequestParam String gender,
            @RequestParam String address,
            RedirectAttributes redirectAttributes) {

        try {
            securityService.logVisitorDetailsByUsername(visitorUsername, name, email, phone, ic, gender, address);
            redirectAttributes.addFlashAttribute("successMessage", "Visitor contact details logged successfully!");
            return "redirect:/securityStaffDashboard";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/visitorVerification";
        }
    }
}
