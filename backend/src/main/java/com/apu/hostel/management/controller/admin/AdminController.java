package com.apu.hostel.management.controller.admin;

import com.apu.hostel.management.model.Residents;
import com.apu.hostel.management.model.SecurityStaff;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private com.apu.hostel.management.service.AdminService adminService;

    @Autowired
    private com.apu.hostel.management.repository.UserRepository userRepository;

    @Autowired
    private com.apu.hostel.management.security.SecurityUtils securityUtils;

    @Autowired
    private com.apu.hostel.management.repository.ResidentRepository residentRepository;

    @Autowired
    private com.apu.hostel.management.repository.SecurityStaffRepository staffRepository;

    private Long getAdminPropertyId() {
        Long userId = securityUtils.getUserId();
        if (userId != null) {
            return userRepository.findById(userId)
                    .map(com.apu.hostel.management.model.MyUsers::getPropertyId)
                    .orElse(null);
        }
        return null;
    }

    @GetMapping("/residents")
    public Page<Residents> getAllResidents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return adminService.searchResidents(getAdminPropertyId(), null, null, PageRequest.of(page, size));
    }

    @GetMapping("/staff")
    public Page<SecurityStaff> getAllStaff(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return adminService.searchStaff(getAdminPropertyId(), null, null, PageRequest.of(page, size));
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
            Long propertyId = getAdminPropertyId();
            // Verify IDOR: Is this resident in the admin's property?
            boolean belongs = residentRepository.findById(id)
                    .map(r -> r.getProperty() != null && r.getProperty().getId().equals(propertyId))
                    .orElse(false);

            if (!belongs) {
                return ResponseEntity.status(403).body("Unauthorized: Resident does not belong to your property");
            }

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
            Long propertyId = getAdminPropertyId();
            boolean belongs = residentRepository.findById(id)
                    .map(r -> r.getProperty() != null && r.getProperty().getId().equals(propertyId))
                    .orElse(false);

            if (!belongs) {
                return ResponseEntity.status(403).body("Unauthorized: Resident does not belong to your property");
            }

            adminService.updateResident(id, null, null, null, null, null, null, true);
            return ResponseEntity.ok(Map.of("message", "Resident approved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/residents/{id}")
    public ResponseEntity<?> deleteResident(@PathVariable Long id) {
        Long propertyId = getAdminPropertyId();
        boolean belongs = residentRepository.findById(id)
                .map(r -> r.getProperty() != null && r.getProperty().getId().equals(propertyId))
                .orElse(false);

        if (!belongs) {
            return ResponseEntity.status(403).body("Unauthorized: Resident does not belong to your property");
        }

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
            Long propertyId = getAdminPropertyId();
            boolean belongs = staffRepository.findById(id)
                    .map(s -> s.getProperty() != null && s.getProperty().getId().equals(propertyId))
                    .orElse(false);

            if (!belongs) {
                return ResponseEntity.status(403).body("Unauthorized: Staff member does not belong to your property");
            }

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
        Long propertyId = getAdminPropertyId();
        boolean belongs = staffRepository.findById(id)
                .map(s -> s.getProperty() != null && s.getProperty().getId().equals(propertyId))
                .orElse(false);

        if (!belongs) {
            return ResponseEntity.status(403).body("Unauthorized: Staff member does not belong to your property");
        }

        adminService.deleteStaff(id);
        return ResponseEntity.ok(Map.of("message", "Staff deleted"));
    }

    private String safeGet(Map<String, Object> data, String key) {
        Object val = data.get(key);
        return val != null ? val.toString() : "";
    }
}
