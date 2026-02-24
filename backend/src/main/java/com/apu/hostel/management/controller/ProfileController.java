package com.apu.hostel.management.controller;

import com.apu.hostel.management.model.MyUsers;
import com.apu.hostel.management.model.Property;
import com.apu.hostel.management.repository.PropertyRepository;
import com.apu.hostel.management.repository.UserRepository;
import com.apu.hostel.management.security.JwtPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
@Slf4j
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    private JwtPrincipal getPrincipal() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof JwtPrincipal jp) {
            return jp;
        }
        return null;
    }

    /** GET /api/profile/me - Returns the logged in user's profile */
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile() {
        JwtPrincipal principal = getPrincipal();
        if (principal == null)
            return ResponseEntity.status(401).body("Not authenticated");

        return userRepository.findById(principal.getUserId())
                .map(user -> {
                    Map<String, Object> resp = new java.util.HashMap<>();
                    resp.put("fullName", user.getFullName() != null ? user.getFullName() : "");
                    resp.put("email", user.getEmail());
                    resp.put("phone", user.getPhone() != null ? user.getPhone() : "");
                    resp.put("address", user.getAddress() != null ? user.getAddress() : "");
                    resp.put("myRole", user.getMyRole());
                    resp.put("profileImage", user.getProfileImage());

                    if (user.getPropertyId() != null) {
                        propertyRepository.findById(user.getPropertyId()).ifPresent(prop -> {
                            resp.put("propertyName", prop.getName());
                            resp.put("propertyAddress", prop.getAddress());
                            resp.put("propertyType", prop.getPropertyType());
                        });
                    }
                    return ResponseEntity.ok(resp);
                })
                .orElse(ResponseEntity.status(404).build());
    }

    /** PUT /api/profile/me - Updates the logged in user's profile */
    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(@RequestBody Map<String, String> data) {
        log.info("Received profile update request for user");
        JwtPrincipal principal = getPrincipal();
        if (principal == null) {
            log.warn("Profile update failed: No authenticated principal found");
            return ResponseEntity.status(401).body("Not authenticated");
        }

        Optional<MyUsers> userOpt = userRepository.findById(principal.getUserId());
        if (userOpt.isEmpty())
            return ResponseEntity.status(404).build();

        MyUsers user = userOpt.get();
        if (data.containsKey("fullName"))
            user.setFullName(data.get("fullName"));
        if (data.containsKey("phone"))
            user.setPhone(data.get("phone"));
        if (data.containsKey("address"))
            user.setAddress(data.get("address"));
        if (data.containsKey("profileImage")) {
            user.setProfileImage(data.get("profileImage"));
        }
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    /**
     * GET /api/profile/manager - Returns the property manager's info for a resident
     */
    @GetMapping("/manager")
    public ResponseEntity<?> getManagerInfo() {
        JwtPrincipal principal = getPrincipal();
        if (principal == null)
            return ResponseEntity.status(401).body("Not authenticated");

        Optional<MyUsers> userOpt = userRepository.findById(principal.getUserId());
        if (userOpt.isEmpty())
            return ResponseEntity.status(404).build();

        MyUsers residentUser = userOpt.get();
        if (residentUser.getPropertyId() == null) {
            return ResponseEntity.status(400).body(Map.of("message", "User not linked to any property"));
        }

        Optional<Property> propertyOpt = propertyRepository.findById(residentUser.getPropertyId());
        if (propertyOpt.isEmpty())
            return ResponseEntity.status(404).body(Map.of("message", "Property not found"));

        MyUsers admin = propertyOpt.get().getAdmin();
        if (admin == null)
            return ResponseEntity.status(404).body(Map.of("message", "Manager not found"));

        return ResponseEntity.ok(Map.of(
                "name", admin.getFullName() != null ? admin.getFullName() : "Admin",
                "email", admin.getEmail(),
                "phone", admin.getPhone() != null ? admin.getPhone() : "N/A",
                "address", admin.getAddress() != null ? admin.getAddress() : "N/A",
                "profileImage", admin.getProfileImage() != null ? admin.getProfileImage() : "",
                "propertyName", propertyOpt.get().getName()));
    }

    /**
     * GET /api/profile/{id} - Returns a profile by id (Resident or
     * Security)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProfileById(@PathVariable Long id) {
        Optional<MyUsers> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            MyUsers user = userOpt.get();
            Map<String, Object> resp = new java.util.HashMap<>();
            resp.put("fullName", user.getFullName() != null ? user.getFullName() : "");
            resp.put("email", user.getEmail());
            resp.put("phone", user.getPhone() != null ? user.getPhone() : "");
            resp.put("address", user.getAddress() != null ? user.getAddress() : "");
            resp.put("myRole", user.getMyRole());
            resp.put("profileImage", user.getProfileImage());

            if (user.getPropertyId() != null) {
                propertyRepository.findById(user.getPropertyId()).ifPresent(prop -> {
                    resp.put("propertyName", prop.getName());
                    resp.put("propertyAddress", prop.getAddress());
                    resp.put("propertyType", prop.getPropertyType());
                });
            }
            return ResponseEntity.ok(resp);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * PUT /api/profile/{id} - Updates a profile by id
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfileById(@PathVariable Long id,
            @RequestBody Map<String, String> data) {
        Optional<MyUsers> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty())
            return ResponseEntity.notFound().build();

        MyUsers user = userOpt.get();
        if (data.containsKey("fullName"))
            user.setFullName(data.get("fullName"));
        if (data.containsKey("phone"))
            user.setPhone(data.get("phone"));
        if (data.containsKey("address"))
            user.setAddress(data.get("address"));
        if (data.containsKey("profileImage"))
            user.setProfileImage(data.get("profileImage"));

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }
}
