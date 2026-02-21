package com.apu.hostel.management.controller;

import com.apu.hostel.management.model.MyUsers;
import com.apu.hostel.management.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
public class StaffController {

    @Autowired
    private StaffService staffService;

    @GetMapping("/addStaff")
    public String showAddStaffForm(Model model) {
        List<MyUsers> availableStaff = staffService.getAvailableSecurityStaff();
        model.addAttribute("availableSecurityStaff", availableStaff);
        return "staffdetails";
    }

    @PostMapping("/addStaff")
    public String registerStaff(
            @RequestParam String selectedUser,
            @RequestParam String givenname,
            @RequestParam String email,
            @RequestParam String phone,
            @RequestParam String IC,
            @RequestParam String gender,
            @RequestParam String addy,
            RedirectAttributes redirectAttributes) {

        try {
            staffService.registerSecurityStaff(selectedUser, givenname, email, phone, IC, gender, addy);
            redirectAttributes.addFlashAttribute("successMessage", "Staff registered successfully!");
        } catch (IllegalArgumentException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }

        return "redirect:/addStaff";
    }
}
