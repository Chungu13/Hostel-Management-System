package com.apu.hostel.management.controller;

import com.apu.hostel.management.model.MyUsers;
import com.apu.hostel.management.model.Property;
import com.apu.hostel.management.repository.UserRepository;

import com.apu.hostel.management.repository.PropertyRepository;
import com.apu.hostel.management.security.JwtUtil;
import com.apu.hostel.management.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import java.io.IOException;
import java.security.GeneralSecurityException;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user login, registration, and session management")
public class AuthController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PropertyRepository propertyRepository;
    @Autowired
    private com.apu.hostel.management.service.ResidentService residentService;
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private SecurityUtils securityUtils;

    @Value("${google.client.id}")
    private String googleClientId;

    @PostMapping("/login")
    @Operation(summary = "Login existing user", description = "Authenticates user and returns JWT token.")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        MyUsers user = userRepository.findByEmail(email)
                .orElseThrow(
                        () -> new IllegalArgumentException("No account found with this email. Please register first."));

        if (!user.getPassword().equals(password)) {
            throw new IllegalArgumentException("Incorrect password. Please try again.");
        }

        // Block login ONLY if they have onboarded but aren't approved yet.
        if (user.isOnboarded() && !user.isApproved() && "Resident".equals(user.getMyRole())) {
            throw new AccessDeniedException("Your account is pending admin approval.");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getMyRole());
        return ResponseEntity.ok(buildAuthResponse(user, token));
    }

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Creates a new user record (defaults to Resident role).")
    public ResponseEntity<?> register(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        String password = data.get("password");
        String role = data.get("role");

        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }

        MyUsers user = new MyUsers();
        user.setEmail(email);
        user.setPassword(password);
        user.setMyRole(role != null ? role : "Resident");
        user.setOnboarded(false);
        user.setApproved(false);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getMyRole());
        return ResponseEntity.ok(buildAuthResponse(user, token));
    }

    @PostMapping("/google")
    @Operation(summary = "Google OAuth Login", description = "Handles Google ID tokens for secure authentication.")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> data)
            throws GeneralSecurityException, IOException {

        String idTokenString = data.get("token");
        System.out.println("=== GOOGLE LOGIN HIT ===");
        System.out.println("Token present: " + (idTokenString != null && !idTokenString.isBlank()));
        System.out.println("Google Client ID on server: " + googleClientId);

        if (googleClientId == null || googleClientId.isBlank()
                || googleClientId.equals("YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com")) {
            System.out.println("Google Client ID is missing or placeholder");
            throw new RuntimeException("Google Client ID is not configured on the server.");
        }

        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken = verifier.verify(idTokenString);
        System.out.println("Token verified successfully? " + (idToken != null));

        if (idToken == null) {
            System.out.println("Google token verification failed");
            throw new AccessDeniedException("Invalid Google ID token.");
        }

        Payload payload = idToken.getPayload();
        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String requestedRole = data.get("role");

        System.out.println("Google email: " + email);
        System.out.println("Google name: " + name);
        System.out.println("Requested role: " + requestedRole);

        Optional<MyUsers> userOpt = userRepository.findByEmail(email);
        MyUsers user;

        if (userOpt.isPresent()) {
            user = userOpt.get();
            System.out.println("Existing user found. Role=" + user.getMyRole()
                    + ", onboarded=" + user.isOnboarded()
                    + ", approved=" + user.isApproved());

            if ((user.getFullName() == null || user.getFullName().isBlank()) && name != null) {
                user.setFullName(name);
                userRepository.save(user);
            }

            if ("Managing Staff".equals(requestedRole)
                    && !user.isOnboarded()
                    && !"Managing Staff".equals(user.getMyRole())) {
                user.setMyRole("Managing Staff");
                userRepository.save(user);
            }
        } else {
            System.out.println("No existing user found. Creating new user.");

            if ("Managing Staff".equals(requestedRole)) {
                System.out.println("Manager login blocked because account does not exist");
                throw new IllegalArgumentException(
                        "No manager account found for this email. Please register your building first.");
            }

            user = new MyUsers();
            user.setEmail(email);
            user.setFullName(name);
            user.setPassword("GOOGLE_AUTH_" + java.util.UUID.randomUUID());
            user.setMyRole(requestedRole != null ? requestedRole : "Resident");
            user.setOnboarded(false);
            user.setApproved(false);
            userRepository.save(user);

            System.out.println("New user created with role=" + user.getMyRole());
        }

        if (user.isOnboarded() && !user.isApproved() && "Resident".equals(user.getMyRole())) {
            System.out.println("User blocked: pending admin approval");
            throw new AccessDeniedException("Your account is pending admin approval.");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getMyRole());
        System.out.println("JWT generated successfully for " + user.getEmail());

        return ResponseEntity.ok(buildAuthResponse(user, token));
    }

    @PostMapping("/admin/onboarding")
    public ResponseEntity<?> adminOnboarding(@RequestBody Map<String, Object> data) {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null) {
            throw new AccessDeniedException("Not authenticated");
        }

        MyUsers user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.isOnboarded()) {
            throw new IllegalArgumentException("Account has already been onboarded");
        }

        Property property = new Property();
        property.setName(data.get("propertyName").toString());
        property.setAddress(data.get("propertyAddress").toString());
        property.setPropertyType(data.get("propertyType").toString());
        property.setAdmin(user);
        property = propertyRepository.save(property);

        user.setFullName(data.get("fullName") != null ? data.get("fullName").toString() : "Admin Manager");
        user.setMyRole("Managing Staff");
        user.setOnboarded(true);
        user.setApproved(true);
        user.setPropertyId(property.getId());
        userRepository.save(user);

        String newToken = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getMyRole());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Onboarding complete");
        response.put("name", user.getFullName());
        response.put("propertyId", property.getId());
        response.put("isOnboarded", true);
        response.put("token", newToken);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/onboarding")
    public ResponseEntity<?> onboarding(@RequestBody Map<String, Object> data) {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null) {
            throw new AccessDeniedException("Not authenticated");
        }

        MyUsers user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Object rawPropertyId = data.get("propertyId");
        if (rawPropertyId == null || rawPropertyId.toString().trim().isEmpty()) {
            throw new IllegalArgumentException("Property selection is required");
        }

        Long propertyId;
        try {
            propertyId = Long.valueOf(rawPropertyId.toString());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid property selection");
        }

        user.setOnboarded(true);
        user.setPropertyId(propertyId);
        user.setFullName(safeGet(data, "name"));
        userRepository.save(user);

        residentService.registerResident(
                currentUserId,
                safeGet(data, "name"),
                user.getEmail(),
                safeGet(data, "phone"),
                safeGet(data, "ic"),
                safeGet(data, "gender"),
                safeGet(data, "address"),
                safeGet(data, "room"),
                propertyId);

        return ResponseEntity.ok(Map.of("message", "Onboarding complete"));
    }

    private String safeGet(Map<String, Object> data, String key) {
        Object value = data.get(key);
        return value != null ? value.toString() : "";
    }

    @GetMapping("/properties")
    public List<Property> getProperties() {
        return propertyRepository.findAll();
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> data) {
        Long currentUserId = securityUtils.getUserId();
        if (currentUserId == null)
            throw new AccessDeniedException("Not authenticated");

        String oldPass = data.get("oldPassword");
        String newPass = data.get("newPassword");

        if (newPass == null || newPass.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters");
        }

        MyUsers user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.getPassword().equals(oldPass)) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPassword(newPass);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    private Map<String, Object> buildAuthResponse(MyUsers user, String token) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("myRole", user.getMyRole());
        response.put("isOnboarded", user.isOnboarded());
        response.put("needsOnboarding", !user.isOnboarded());
        response.put("isApproved", user.isApproved());
        response.put("createdAt", user.getCreatedAt());
        response.put("token", token);

        if (user.isOnboarded()) {
            response.put("propertyId", user.getPropertyId());
        }

        String displayName = user.getFullName();
        if (displayName == null || displayName.isBlank()) {
            displayName = user.getEmail().split("@")[0];
            if (displayName.length() > 0) {
                displayName = Character.toUpperCase(displayName.charAt(0)) + displayName.substring(1).toLowerCase();
            }
        }
        response.put("name", displayName);

        return response;
    }
}
