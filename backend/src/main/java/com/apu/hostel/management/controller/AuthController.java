package com.apu.hostel.management.controller;

import com.apu.hostel.management.model.MyUsers;
import com.apu.hostel.management.repository.UserRepository;
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
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/")
    public String index(HttpSession session) {
        MyUsers user = (MyUsers) session.getAttribute("user");
        if (user != null) {
            String role = user.getMyRole();
            if ("Managing Staff".equals(role)) {
                return "redirect:/managingStaffDashboard";
            } else if ("Resident".equals(role)) {
                return "redirect:/residentsDashboard";
            } else if ("Security Staff".equals(role)) {
                return "redirect:/securityStaffDashboard";
            }
        }
        return "redirect:/login";
    }

    @GetMapping("/login")
    public String showLoginForm() {
        return "login";
    }

    @PostMapping("/login")
    public String processLogin(
            @RequestParam String username,
            @RequestParam String password,
            HttpSession session,
            Model model) {

        Optional<MyUsers> userOpt = userRepository.findByUserNameAndPassword(username, password);

        if (userOpt.isPresent()) {
            MyUsers user = userOpt.get();
            session.setAttribute("user", user);
            session.setAttribute("role", user.getMyRole());

            String role = user.getMyRole();
            if ("Managing Staff".equals(role)) {
                return "redirect:/managingStaffDashboard";
            } else if ("Resident".equals(role)) {
                return "redirect:/residentsDashboard";
            } else if ("Security Staff".equals(role)) {
                return "redirect:/securityStaffDashboard";
            }
            return "redirect:/";
        } else {
            model.addAttribute("errorMessage", "Invalid username or password");
            return "login";
        }
    }

    @GetMapping("/register")
    public String showRegisterForm() {
        return "register";
    }

    @PostMapping("/register")
    public String processRegister(
            @RequestParam String name,
            @RequestParam String pass,
            RedirectAttributes redirectAttributes) {

        if (userRepository.findByUserName(Objects.requireNonNull(name)).isPresent()) {
            redirectAttributes.addFlashAttribute("errorMessage", "Username already exists");
            return "redirect:/register";
        }

        MyUsers newUser = new MyUsers();
        newUser.setUserName(Objects.requireNonNull(name));
        newUser.setPassword(pass);
        newUser.setMyRole("Resident"); // Default role
        userRepository.save(newUser);

        redirectAttributes.addFlashAttribute("successMessage", "Registration successful! Please add your details.");
        return "redirect:/register";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login";
    }
}
