package com.apu.hostel.management.controller.admin;

import com.apu.hostel.management.model.MyUsers;
import com.apu.hostel.management.model.Residents;
import com.apu.hostel.management.model.SecurityStaff;
import com.apu.hostel.management.security.JwtPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private com.apu.hostel.management.service.AdminService adminService;

    @Autowired
    private com.apu.hostel.management.repository.UserRepository userRepository;

    private Long getAdminPropertyId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof JwtPrincipal principal) {
            MyUsers user = userRepository.findById(principal.getUserId()).orElse(null);
            if (user != null) {
                return user.getPropertyId();
            }
        }
        throw new IllegalStateException("Authentication context missing or invalid admin profile.");
    }

    @GetMapping("/residents")
    public List<Residents> getAllResidents() {
        return adminService.searchResidents(getAdminPropertyId(), null, null);
    }

    @GetMapping("/staff")
    public List<SecurityStaff> getAllStaff() {
        return adminService.searchStaff(getAdminPropertyId(), null, null);
    }

    @PostMapping("/residents")
    public ResponseEntity<?> createResident(@RequestBody Map<String, Object> data) {
        try {
            String email = safeGet(data, "email");
            if (email.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
            }

            adminService.handleAdminResidentRegistration(
                    email,
                    safeGet(data, "name"),
                    safeGet(data, "phone"),
                    safeGet(data, "ic"),
                    safeGet(data, "gender"),
                    "Property Resident",
                    safeGet(data, "room"),
                    getAdminPropertyId(),
                    true, // Auto-approved when created by admin
                    safeGet(data, "password"));
            return ResponseEntity.ok(Map.of("message", "Resident created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/residents/{id}")
    public ResponseEntity<?> updateResident(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        try {
            adminService.updateResident(
                    id,
                    safeGet(data, "name"),
                    safeGet(data, "email"),
                    safeGet(data, "phone"),
                    safeGet(data, "ic"),
                    safeGet(data, "gender"),
                    safeGet(data, "address"),
                    data.get("approved") != null ? (Boolean) data.get("approved") : true);
            return ResponseEntity.ok(Map.of("message", "Resident updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/approve-resident/{id}")
    public ResponseEntity<?> approveResident(@PathVariable Long id) {
        try {
            adminService.updateResident(id, null, null, null, null, null, null, true);
            return ResponseEntity.ok(Map.of("message", "Resident approved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/residents/{id}")
    public ResponseEntity<?> deleteResident(@PathVariable Long id) {
        adminService.deleteResident(id);
        return ResponseEntity.ok(Map.of("message", "Resident deleted"));
    }

    @PostMapping("/staff")
    public ResponseEntity<?> createStaff(@RequestBody Map<String, Object> data) {
        try {
            String email = safeGet(data, "email");
            if (email.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
            }

            SecurityStaff staff = adminService.handleAdminStaffRegistration(
                    email,
                    safeGet(data, "name"),
                    safeGet(data, "phone"),
                    safeGet(data, "ic"),
                    safeGet(data, "gender"),
                    safeGet(data, "address"),
                    getAdminPropertyId(),
                    safeGet(data, "password"));
            return ResponseEntity.ok(staff);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/staff/{id}")
    public ResponseEntity<?> updateStaff(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        try {
            adminService.updateStaff(
                    id,
                    safeGet(data, "name"),
                    safeGet(data, "email"),
                    safeGet(data, "phone"),
                    safeGet(data, "ic"),
                    safeGet(data, "gender"),
                    safeGet(data, "address"));
            return ResponseEntity.ok(Map.of("message", "Staff updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/staff/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable Long id) {
        adminService.deleteStaff(id);
        return ResponseEntity.ok(Map.of("message", "Staff deleted"));
    }

    private String safeGet(Map<String, Object> data, String key) {
        Object val = data.get(key);
        return val != null ? val.toString() : "";
    }
}
