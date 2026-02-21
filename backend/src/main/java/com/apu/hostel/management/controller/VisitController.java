package com.apu.hostel.management.controller;

import com.apu.hostel.management.model.MyUsers;

import jakarta.servlet.http.HttpSession;
import com.apu.hostel.management.service.VisitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class VisitController {

    @Autowired
    private VisitService visitService;

    @GetMapping("/requestVisit")
    public String showRequestVisitForm(HttpSession session, Model model) {
        MyUsers loggedUser = (MyUsers) session.getAttribute("user");
        if (loggedUser == null || !"Resident".equals(loggedUser.getMyRole())) {
            return "redirect:/login";
        }
        model.addAttribute("username", loggedUser.getUserName());
        return "requestVisit";
    }

    @PostMapping("/requestVisit")
    public String processVisitRequest(
            @RequestParam String residentName,
            @RequestParam String visitorName,
            @RequestParam String visitorUsername,
            @RequestParam String visitorPassword,
            HttpSession session,
            RedirectAttributes redirectAttributes) {

        MyUsers loggedUser = (MyUsers) session.getAttribute("user");
        if (loggedUser == null) {
            return "redirect:/login";
        }

        try {
            visitService.createVisitRequest(loggedUser.getUserName(), residentName, visitorName, visitorUsername,
                    visitorPassword);
            redirectAttributes.addFlashAttribute("successMessage", "Visit request submitted successfully!");
        } catch (IllegalArgumentException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }

        return "redirect:/requestVisit";
    }

    @GetMapping("/viewVisitRequests")
    public String viewVisitRequests(HttpSession session, Model model) {
        MyUsers loggedUser = (MyUsers) session.getAttribute("user");
        if (loggedUser == null || !"Resident".equals(loggedUser.getMyRole())) {
            return "redirect:/login";
        }

        model.addAttribute("visitRequests", visitService.getRequestsByResident(loggedUser.getUserName()));
        return "viewVisitRequests";
    }

    @PostMapping("/updateVisitStatus")
    public String updateVisitStatus(
            @RequestParam Long id,
            @RequestParam String status,
            RedirectAttributes redirectAttributes) {

        try {
            visitService.updateStatus(id, status);
            redirectAttributes.addFlashAttribute("successMessage", "Request status updated successfully!");
        } catch (IllegalArgumentException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }

        return "redirect:/viewVisitRequests";
    }

    @GetMapping("/viewVisitHistory")
    public String viewVisitHistory(HttpSession session, Model model) {
        MyUsers loggedUser = (MyUsers) session.getAttribute("user");
        if (loggedUser == null || !"Resident".equals(loggedUser.getMyRole())) {
            return "redirect:/login";
        }

        model.addAttribute("visitRequests", visitService.getRequestsByResident(loggedUser.getUserName()));
        return "viewVisitHistory";
    }
}
