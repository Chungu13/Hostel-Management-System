package com.apu.hostel.management.controller;

import com.apu.hostel.management.model.MyUsers;
import com.apu.hostel.management.model.Residents;
import com.apu.hostel.management.model.SecurityStaff;
import com.apu.hostel.management.repository.ResidentRepository;
import com.apu.hostel.management.repository.SecurityStaffRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Objects;
import java.util.Optional;

@Controller
public class ProfileController {

    @Autowired
    private ResidentRepository residentRepository;

    @Autowired
    private SecurityStaffRepository securityStaffRepository;

    @GetMapping("/editProfile")
    public String showEditProfile(HttpSession session, Model model) {
        MyUsers user = (MyUsers) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }

        String role = user.getMyRole();
        if ("Resident".equals(role)) {
            Optional<Residents> resident = residentRepository
                    .findByUsername(Objects.requireNonNull(user.getUserName()));
            if (resident.isPresent()) {
                model.addAttribute("profile", resident.get());
                return "editProfileResident";
            }
        } else if ("Security Staff".equals(role) || "Managing Staff".equals(role)) {
            Optional<SecurityStaff> staff = securityStaffRepository
                    .findByUsername(Objects.requireNonNull(user.getUserName()));
            if (staff.isPresent()) {
                model.addAttribute("profile", staff.get());
                return "editProfileStaff";
            }
        }

        return "redirect:/";
    }

    @PostMapping("/editProfileResident")
    public String updateResidentProfile(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String phone,
            @RequestParam String address,
            HttpSession session,
            RedirectAttributes redirectAttributes) {

        MyUsers user = (MyUsers) session.getAttribute("user");
        if (user == null)
            return "redirect:/login";

        Optional<Residents> residentOpt = residentRepository.findByUsername(Objects.requireNonNull(user.getUserName()));
        if (residentOpt.isPresent()) {
            Residents resident = residentOpt.get();
            resident.setName(name);
            resident.setEmail(email);
            resident.setPhone(phone);
            resident.setAddress(address);
            residentRepository.save(resident);
            redirectAttributes.addFlashAttribute("successMessage", "Profile updated successfully!");
        }

        return "redirect:/editProfile";
    }

    @PostMapping("/editProfileStaff")
    public String updateStaffProfile(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String phone,
            @RequestParam String address,
            HttpSession session,
            RedirectAttributes redirectAttributes) {

        MyUsers user = (MyUsers) session.getAttribute("user");
        if (user == null)
            return "redirect:/login";

        Optional<SecurityStaff> staffOpt = securityStaffRepository
                .findByUsername(Objects.requireNonNull(user.getUserName()));
        if (staffOpt.isPresent()) {
            SecurityStaff staff = staffOpt.get();
            staff.setName(name);
            staff.setEmail(email);
            staff.setPhone(phone);
            staff.setAddress(address);
            securityStaffRepository.save(staff);
            redirectAttributes.addFlashAttribute("successMessage", "Profile updated successfully!");
        }

        return "redirect:/editProfile";
    }
}
