package com.apu.hostel.management.controller;

import com.apu.hostel.management.model.MyUsers;
import com.apu.hostel.management.model.Property;
import com.apu.hostel.management.repository.PropertyRepository;
import com.apu.hostel.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;
import java.util.Optional;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/profile")
@Slf4j
@Tag(name = "Profile", description = "User profile management (View, Edit, IC/NRC Validation)")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private com.apu.hostel.management.security.SecurityUtils securityUtils;

    /** GET /api/profile/me - Returns the logged in user's profile */
    @GetMapping("/me")
    @Operation(summary = "Get current user profile", description = "Returns full profile details for the authenticated user.")
    public ResponseEntity<?> getMyProfile() {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            throw new IllegalArgumentException("Not authenticated");

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
                .orElseThrow(() -> new IllegalArgumentException("User profile not found"));
    }

    /** PUT /api/profile/me - Updates the logged in user's profile */
    @PutMapping("/me")
    @Operation(summary = "Update current user profile", description = "Updates details with validation for phone, name, and NRC.")
    public ResponseEntity<?> updateMyProfile(@RequestBody Map<String, String> data) {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            throw new IllegalArgumentException("Not authenticated");
        return updateProfileLogic(currentUserId, data, false);
    }

    /** POST /api/profile/clear-history - Clears history from user's view */
    @PostMapping("/clear-history")
    @Operation(summary = "Clear notification history", description = "Soft-clears history for the authenticated user.")
    public ResponseEntity<?> clearHistory() {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            throw new IllegalArgumentException("Not authenticated");

        MyUsers user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

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
            throw new IllegalArgumentException("Not authenticated");

        MyUsers residentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (residentUser.getPropertyId() == null) {
            throw new IllegalArgumentException("User not linked to any property");
        }

        Property property = propertyRepository.findById(residentUser.getPropertyId())
                .orElseThrow(() -> new IllegalArgumentException("Property not found"));

        MyUsers admin = property.getAdmin();
        if (admin == null)
            throw new IllegalArgumentException("Manager not found for this property");

        return ResponseEntity.ok(Map.of(
                "name", admin.getFullName() != null ? admin.getFullName() : "Property Manager",
                "email", admin.getEmail(),
                "phone", admin.getPhone() != null ? admin.getPhone() : "N/A",
                "address", admin.getAddress() != null ? admin.getAddress() : "N/A",
                "profileImage", admin.getProfileImage() != null ? admin.getProfileImage() : "",
                "propertyName", property.getName()));
    }

    /**
     * GET /api/profile/{id} - Returns a profile by id
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProfileById(@PathVariable Long id) {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            throw new IllegalArgumentException("Not authenticated");

        MyUsers targetUser = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));

        MyUsers currentUser = userRepository.findById(currentUserId).orElse(null);

        // Authorization logic
        boolean isOwner = currentUserId.equals(id);
        boolean isStaff = securityUtils.isManagingStaff() || securityUtils.isSecurityStaff();
        boolean sameProperty = currentUser != null && targetUser.getPropertyId() != null
                && targetUser.getPropertyId().equals(currentUser.getPropertyId());

        // Rule: Only owner OR (Staff AND same property) can view details
        if (!isOwner && !(isStaff && sameProperty)) {
            throw new AccessDeniedException("Unauthorized to view this profile");
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
            throw new IllegalArgumentException("Not authenticated");

        MyUsers targetUser = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));

        MyUsers currentUser = userRepository.findById(currentUserId).orElse(null);

        // Authorization: Only owner or (Staff AND same property) can update
        boolean isOwner = currentUserId.equals(id);
        boolean isStaff = securityUtils.isManagingStaff();
        boolean sameProperty = currentUser != null && targetUser.getPropertyId() != null
                && targetUser.getPropertyId().equals(currentUser.getPropertyId());

        if (!isOwner && !(isStaff && sameProperty)) {
            throw new AccessDeniedException("Unauthorized to update this profile");
        }

        return updateProfileLogic(id, data, isStaff);
    }

    private ResponseEntity<?> updateProfileLogic(Long id, Map<String, String> data, boolean isAdmin) {
        MyUsers user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));

        // 1. Validate & Format Full Name
        if (data.containsKey("fullName")) {
            String rawName = data.get("fullName").trim();
            if (rawName.isEmpty() || rawName.length() < 3 || rawName.length() > 100) {
                throw new IllegalArgumentException("Full name must be between 3 and 100 characters.");
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
                throw new IllegalArgumentException(
                        "Phone number must be in Zambian format: +260 followed by 9 digits.");
            }
            user.setPhone(phone);
        }

        // 2.1 Validate NRC (Zambian format: ######/##/#)
        if (data.containsKey("ic")) {
            String ic = data.get("ic").trim();
            if (!ic.matches("^[0-9]{6}/[0-9]{2}/[0-9]{1}$")) {
                throw new IllegalArgumentException("NRC must be in Zambian format: ######/##/# (e.g., 123456/11/1)");
            }
            user.setIc(ic);
        }

        // 3. Validate Email
        if (data.containsKey("email")) {
            String email = data.get("email").trim().toLowerCase();
            if (!email.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$")) {
                throw new IllegalArgumentException("Invalid email format.");
            }
            // Check if email is already taken by ANOTHER user
            Optional<MyUsers> existing = userRepository.findByEmail(email);
            if (existing.isPresent() && !existing.get().getId().equals(id)) {
                throw new IllegalArgumentException("Email is already in use by another account.");
            }
            user.setEmail(email);
        }

        // 4. Protection: Users cannot change their own Role
        if (data.containsKey("myRole") && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to change account roles.");
        } else if (data.containsKey("myRole") && isAdmin) {
            user.setMyRole(data.get("myRole"));
        }

        if (data.containsKey("profileImage")) {
            user.setProfileImage(data.get("profileImage"));
        }

        userRepository.save(user);
        log.info("Profile updated successfully for user ID: {}", id);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }
}
