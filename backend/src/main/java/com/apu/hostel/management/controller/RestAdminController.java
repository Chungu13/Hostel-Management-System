package com.apu.hostel.management.controller;

import com.apu.hostel.management.model.Residents;
import com.apu.hostel.management.model.SecurityStaff;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class RestAdminController {

    @Autowired
    private com.apu.hostel.management.service.AdminService adminService;

    @GetMapping("/residents")
    public List<Residents> getAllResidents(@RequestParam Long propertyId) {
        return adminService.searchResidents(propertyId, null, null);
    }

    @GetMapping("/staff")
    public List<SecurityStaff> getAllStaff(@RequestParam Long propertyId) {
        return adminService.searchStaff(propertyId, null, null);
    }

    @PostMapping("/residents")
    public ResponseEntity<?> createResident(@RequestBody Map<String, Object> data) {
        try {
            adminService.updateResident(
                    data.get("username").toString(),
                    data.get("name").toString(),
                    data.get("email").toString(),
                    data.get("phone").toString(),
                    data.get("gender").toString(),
                    data.get("address").toString(),
                    (Boolean) data.get("approved"));
            return ResponseEntity.ok(Map.of("message", "Resident created/updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/residents/{username}")
    public ResponseEntity<?> updateResident(@PathVariable String username, @RequestBody Map<String, Object> data) {
        try {
            adminService.updateResident(
                    username,
                    data.get("name").toString(),
                    data.get("email").toString(),
                    data.get("phone").toString(),
                    data.get("gender").toString(),
                    data.get("address").toString(),
                    (Boolean) data.get("approved"));
            return ResponseEntity.ok(Map.of("message", "Resident updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/approve-resident/{username}")
    public ResponseEntity<?> approveResident(@PathVariable String username) {
        try {
            adminService.updateResident(username, null, null, null, null, null, true); // Partial update logic needs to
                                                                                       // be careful
            return ResponseEntity.ok(Map.of("message", "Resident approved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/residents/{username}")
    public ResponseEntity<?> deleteResident(@PathVariable String username) {
        adminService.deleteResident(username);
        return ResponseEntity.ok(Map.of("message", "Resident deleted"));
    }

    @PostMapping("/staff")
    public ResponseEntity<?> createStaff(@RequestBody Map<String, Object> data) {
        try {
            SecurityStaff staff = adminService.registerStaff(
                    data.get("username").toString(),
                    data.get("name").toString(),
                    data.get("email").toString(),
                    data.get("phone").toString(),
                    data.get("ic").toString(),
                    data.get("gender").toString(),
                    data.get("address").toString(),
                    Long.valueOf(data.get("propertyId").toString()));
            return ResponseEntity.ok(staff);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/staff/{username}")
    public ResponseEntity<?> updateStaff(@PathVariable String username, @RequestBody Map<String, Object> data) {
        try {
            adminService.updateStaff(
                    username,
                    data.get("name").toString(),
                    data.get("email").toString(),
                    data.get("phone").toString(),
                    data.get("gender").toString(),
                    data.get("address").toString());
            return ResponseEntity.ok(Map.of("message", "Staff updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/staff/{username}")
    public ResponseEntity<?> deleteStaff(@PathVariable String username) {
        adminService.deleteStaff(username);
        return ResponseEntity.ok(Map.of("message", "Staff deleted"));
    }
}
