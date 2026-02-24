package com.apu.hostel.management.controller.admin;

import com.apu.hostel.management.model.Residents;
import com.apu.hostel.management.model.SecurityStaff;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

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
                    Long.valueOf(data.get("userId").toString()),
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

    @PutMapping("/residents/{id}")
    public ResponseEntity<?> updateResident(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        try {
            adminService.updateResident(
                    id,
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

    @PostMapping("/approve-resident/{id}")
    public ResponseEntity<?> approveResident(@PathVariable Long id) {
        try {
            adminService.updateResident(id, null, null, null, null, null, true);
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
            SecurityStaff staff = adminService.registerStaff(
                    Long.valueOf(data.get("userId").toString()),
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

    @PutMapping("/staff/{id}")
    public ResponseEntity<?> updateStaff(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        try {
            adminService.updateStaff(
                    id,
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

    @DeleteMapping("/staff/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable Long id) {
        adminService.deleteStaff(id);
        return ResponseEntity.ok(Map.of("message", "Staff deleted"));
    }
}
