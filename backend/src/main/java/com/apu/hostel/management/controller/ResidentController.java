package com.apu.hostel.management.controller;

import com.apu.hostel.management.service.ResidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class ResidentController {

    @Autowired
    private ResidentService residentService;

    @GetMapping("/residentsInformation")
    public String showResidentInfoForm(Model model) {
        model.addAttribute("availableResidents", residentService.getAvailableResidents());
        return "residentsInformation";
    }

    @PostMapping("/residentsInformation")
    public String submitResidentInfo(
            @RequestParam String selectedUser,
            @RequestParam String givenname,
            @RequestParam String email,
            @RequestParam String phone,
            @RequestParam String IC,
            @RequestParam String gender,
            @RequestParam String addy,
            @RequestParam String roomnum,
            RedirectAttributes redirectAttributes) {

        try {
            // Legacy controller doesn't support property selection yet, passing null
            residentService.registerResident(selectedUser, givenname, email, phone, IC, gender, addy, roomnum, null);
            redirectAttributes.addFlashAttribute("successMessage",
                    "Details submitted successfully! Waiting for approval.");
            return "redirect:/login";

        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/residentsInformation";
        }
    }
}
