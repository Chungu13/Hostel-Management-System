package com.apu.hostel.management.controller;

import com.apu.hostel.management.model.MyUsers;
import com.apu.hostel.management.model.Property;
import com.apu.hostel.management.repository.PropertyRepository;
import com.apu.hostel.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    @Autowired
    private com.apu.hostel.management.security.SecurityUtils securityUtils;

    /** GET /api/profile/me - Returns the logged in user's profile */
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile() {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            return ResponseEntity.status(401).body("Not authenticated");

        return userRepository.findById(currentUserId)
                .map(user -> {
                    Map<String, Object> resp = new java.util.HashMap<>();
                    resp.put("fullName", user.getFullName() != null ? user.getFullName() : "");
                    resp.put("email", user.getEmail());
                    resp.put("phone", user.getPhone() != null ? user.getPhone() : "");
                    resp.put("ic", user.getIc() != null ? user.getIc() : "");
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
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            return ResponseEntity.status(401).body("Not authenticated");
        return updateProfileLogic(currentUserId, data, false);
    }

    /** POST /api/profile/clear-history - Clears history from user's view */
    @PostMapping("/clear-history")
    public ResponseEntity<?> clearHistory() {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            return ResponseEntity.status(401).body("Not authenticated");

        Optional<MyUsers> userOpt = userRepository.findById(currentUserId);
        if (userOpt.isEmpty())
            return ResponseEntity.status(404).build();

        MyUsers user = userOpt.get();
        user.setHistoryClearedAt(java.time.LocalDateTime.now());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "History cleared from view successfully"));
    }

    /**
     * GET /api/profile/manager - Returns the property manager's info for a resident
     */
    @GetMapping("/manager")
    public ResponseEntity<?> getManagerInfo() {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            return ResponseEntity.status(401).body("Not authenticated");

        Optional<MyUsers> userOpt = userRepository.findById(currentUserId);
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
                "name", admin.getFullName() != null ? admin.getFullName() : "Property Manager",
                "email", admin.getEmail(),
                "phone", admin.getPhone() != null ? admin.getPhone() : "N/A",
                "address", admin.getAddress() != null ? admin.getAddress() : "N/A",
                "profileImage", admin.getProfileImage() != null ? admin.getProfileImage() : "",
                "propertyName", propertyOpt.get().getName()));
    }

    /**
     * GET /api/profile/{id} - Returns a profile by id
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProfileById(@PathVariable Long id) {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            return ResponseEntity.status(401).body("Not authenticated");

        Optional<MyUsers> targetUserOpt = userRepository.findById(id);
        if (targetUserOpt.isEmpty())
            return ResponseEntity.notFound().build();

        MyUsers targetUser = targetUserOpt.get();
        MyUsers currentUser = userRepository.findById(currentUserId).orElse(null);

        // Authorization logic
        boolean isOwner = currentUserId.equals(id);
        boolean isStaff = securityUtils.isManagingStaff() || securityUtils.isSecurityStaff();
        boolean sameProperty = currentUser != null && targetUser.getPropertyId() != null
                && targetUser.getPropertyId().equals(currentUser.getPropertyId());

        // Rule: Only owner OR (Staff AND same property) can view details
        if (!isOwner && !(isStaff && sameProperty)) {
            return ResponseEntity.status(403).body("Unauthorized to view this profile");
        }

        Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("fullName", targetUser.getFullName() != null ? targetUser.getFullName() : "");
        resp.put("email", targetUser.getEmail());
        resp.put("phone", targetUser.getPhone() != null ? targetUser.getPhone() : "");
        resp.put("ic", targetUser.getIc() != null ? targetUser.getIc() : "");
        resp.put("myRole", targetUser.getMyRole());
        resp.put("profileImage", targetUser.getProfileImage());

        if (targetUser.getPropertyId() != null) {
            propertyRepository.findById(targetUser.getPropertyId()).ifPresent(prop -> {
                resp.put("propertyName", prop.getName());
                resp.put("propertyAddress", prop.getAddress());
                resp.put("propertyType", prop.getPropertyType());
            });
        }
        return ResponseEntity.ok(resp);
    }

    /** PUT /api/profile/{id} - Updates a profile by id */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfileById(@PathVariable Long id, @RequestBody Map<String, String> data) {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            return ResponseEntity.status(401).body("Not authenticated");

        Optional<MyUsers> targetUserOpt = userRepository.findById(id);
        if (targetUserOpt.isEmpty())
            return ResponseEntity.notFound().build();

        MyUsers targetUser = targetUserOpt.get();
        MyUsers currentUser = userRepository.findById(currentUserId).orElse(null);

        // Authorization: Only owner or (Staff AND same property) can update
        boolean isOwner = currentUserId.equals(id);
        boolean isStaff = securityUtils.isManagingStaff();
        boolean sameProperty = currentUser != null && targetUser.getPropertyId() != null
                && targetUser.getPropertyId().equals(currentUser.getPropertyId());

        if (!isOwner && !(isStaff && sameProperty)) {
            return ResponseEntity.status(403).body("Unauthorized to update this profile");
        }

        return updateProfileLogic(id, data, isStaff);
    }

    private ResponseEntity<?> updateProfileLogic(Long id, Map<String, String> data, boolean isAdmin) {
        Optional<MyUsers> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty())
            return ResponseEntity.notFound().build();
        MyUsers user = userOpt.get();

        // 1. Validate & Format Full Name (Chungu Muloshi format)
        if (data.containsKey("fullName")) {
            String rawName = data.get("fullName").trim();
            if (rawName.isEmpty() || rawName.length() < 3 || rawName.length() > 100) {
                return ResponseEntity.badRequest().body("Full name must be between 3 and 100 characters.");
            }

            // Format to Title Case
            String[] words = rawName.toLowerCase().split("\\s+");
            StringBuilder formattedName = new StringBuilder();
            for (String word : words) {
                if (word.length() > 0) {
                    formattedName.append(Character.toUpperCase(word.charAt(0)))
                            .append(word.substring(1))
                            .append(" ");
                }
            }
            user.setFullName(formattedName.toString().trim());
        }

        // 2. Validate Phone (Zambian format: +260XXXXXXXXX)
        if (data.containsKey("phone")) {
            String phone = data.get("phone").trim();
            if (!phone.matches("^\\+260[0-9]{9}$")) {
                return ResponseEntity.badRequest()
                        .body("Phone number must be in Zambian format: +260 followed by 9 digits.");
            }
            user.setPhone(phone);
        }

        // 2.1 Validate NRC (Zambian format: ######/##/#)
        if (data.containsKey("ic")) {
            String ic = data.get("ic").trim();
            if (!ic.matches("^[0-9]{6}/[0-9]{2}/[0-9]{1}$")) {
                return ResponseEntity.badRequest()
                        .body("NRC must be in Zambian format: ######/##/# (e.g., 123456/11/1)");
            }
            user.setIc(ic);
        }

        // 3. Validate Email
        if (data.containsKey("email")) {
            String email = data.get("email").trim().toLowerCase();
            if (!email.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$")) {
                return ResponseEntity.badRequest().body("Invalid email format.");
            }
            // Check if email is already taken by ANOTHER user
            Optional<MyUsers> existing = userRepository.findByEmail(email);
            if (existing.isPresent() && !existing.get().getId().equals(id)) {
                return ResponseEntity.badRequest().body("Email is already in use by another account.");
            }
            user.setEmail(email);
        }

        // 4. Protection: Users cannot change their own Role
        if (data.containsKey("myRole") && !isAdmin) {
            return ResponseEntity.status(403).body("You are not authorized to change account roles.");
        } else if (data.containsKey("myRole") && isAdmin) {
            user.setMyRole(data.get("myRole"));
        }

        if (data.containsKey("profileImage")) {
            user.setProfileImage(data.get("profileImage"));
        }

        // Note: Permanent Address removal from update flow as requested
        // user.setAddress(...) is intentionally omitted here

        userRepository.save(user);
        log.info("Profile updated successfully for user ID: {}", id);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }
}
