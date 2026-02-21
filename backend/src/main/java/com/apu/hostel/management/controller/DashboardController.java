package com.apu.hostel.management.controller;

import com.apu.hostel.management.model.MyUsers;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

    @GetMapping("/managingStaffDashboard")
    public String managingStaffDashboard(HttpSession session, Model model) {
        MyUsers user = (MyUsers) session.getAttribute("user");
        if (user == null || !"Managing Staff".equals(user.getMyRole())) {
            return "redirect:/login";
        }
        model.addAttribute("username", user.getUserName());
        return "managingStaffDashboard";
    }

    @GetMapping("/residentsDashboard")
    public String residentsDashboard(HttpSession session, Model model) {
        MyUsers user = (MyUsers) session.getAttribute("user");
        if (user == null || !"Resident".equals(user.getMyRole())) {
            return "redirect:/login";
        }
        model.addAttribute("username", user.getUserName());
        return "residentsDashboard";
    }

    @GetMapping("/securityStaffDashboard")
    public String securityStaffDashboard(HttpSession session, Model model) {
        MyUsers user = (MyUsers) session.getAttribute("user");
        if (user == null || !"Security Staff".equals(user.getMyRole())) {
            return "redirect:/login";
        }
        model.addAttribute("username", user.getUserName());
        return "securityStaffDashboard";
    }
}
