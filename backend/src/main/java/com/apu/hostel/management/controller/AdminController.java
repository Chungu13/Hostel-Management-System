package com.apu.hostel.management.controller;

import com.apu.hostel.management.model.Residents;
import com.apu.hostel.management.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import org.springframework.lang.NonNull;
import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/viewResidents")
    public String viewResidents(
            @RequestParam(required = false) String searchType,
            @RequestParam(required = false) String searchValue,
            Model model) {

        // Legacy controller doesn't support property filtering yet, passing null
        List<Residents> residents = adminService.searchResidents(null, searchType, searchValue);
        if (searchType != null && searchValue != null && !searchValue.trim().isEmpty()) {
            model.addAttribute("searchResults", residents);
        } else {
            model.addAttribute("residentsList", residents);
        }
        return "viewResidents";
    }

    @PostMapping("/updateResident")
    public String updateResident(
            @RequestParam @NonNull String username,
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String phone,
            @RequestParam String gender,
            @RequestParam String address,
            @RequestParam String approved,
            RedirectAttributes redirectAttributes) {

        try {
            boolean isApproved = "Yes".equalsIgnoreCase(approved) || "True".equalsIgnoreCase(approved);
            adminService.updateResident(username, name, email, phone, gender, address, isApproved);
            redirectAttributes.addFlashAttribute("successMessage", "Resident updated successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/admin/viewResidents";
    }

    @GetMapping("/deleteResident")
    public String deleteResident(@RequestParam @NonNull String username, RedirectAttributes redirectAttributes) {
        try {
            adminService.deleteResident(username);
            redirectAttributes.addFlashAttribute("successMessage", "Resident deleted successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/admin/viewResidents";
    }

    @GetMapping("/viewStaff")
    public String viewStaff(
            @RequestParam(required = false) String searchType,
            @RequestParam(required = false) String searchValue,
            Model model) {

        // Legacy controller doesn't support property filtering yet, passing null
        List<com.apu.hostel.management.model.SecurityStaff> staff = adminService.searchStaff(null, searchType,
                searchValue);
        if (searchType != null && searchValue != null && !searchValue.trim().isEmpty()) {
            model.addAttribute("searchResults", staff);
        } else {
            model.addAttribute("staffList", staff);
        }
        return "viewStaff";
    }

    @PostMapping("/updateStaff")
    public String updateStaff(
            @RequestParam @NonNull String username,
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String phone,
            @RequestParam String gender,
            @RequestParam String address,
            RedirectAttributes redirectAttributes) {

        try {
            adminService.updateStaff(username, name, email, phone, gender, address);
            redirectAttributes.addFlashAttribute("successMessage", "Staff member updated successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/admin/viewStaff";
    }

    @GetMapping("/deleteStaff")
    public String deleteStaff(@RequestParam @NonNull String username, RedirectAttributes redirectAttributes) {
        try {
            adminService.deleteStaff(username);
            redirectAttributes.addFlashAttribute("successMessage", "Staff member deleted successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/admin/viewStaff";
    }
}
