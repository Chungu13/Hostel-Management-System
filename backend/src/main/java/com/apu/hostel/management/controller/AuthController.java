package com.apu.hostel.management.controller;

import com.apu.hostel.management.model.MyUsers;
import com.apu.hostel.management.model.Property;
import com.apu.hostel.management.repository.UserRepository;

import com.apu.hostel.management.repository.PropertyRepository;
import com.apu.hostel.management.security.JwtPrincipal;
import com.apu.hostel.management.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PropertyRepository propertyRepository;
    @Autowired
    private com.apu.hostel.management.service.ResidentService residentService;
    @Autowired
    private JwtUtil jwtUtil;

    @Value("${google.client.id}")
    private String googleClientId;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Optional<MyUsers> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "No account found with this email. Please register first."));
        }

        MyUsers user = userOpt.get();
        if (!user.getPassword().equals(password)) {
            return ResponseEntity.status(401).body(Map.of("message", "Incorrect password. Please try again."));
        }

        // Block login ONLY if they have onboarded but aren't approved yet.
        // This allows new users to log in to complete onboarding.
        if (user.isOnboarded() && !user.isApproved() && "Resident".equals(user.getMyRole())) {
            return ResponseEntity.status(403).body(Map.of("message", "Your account is pending admin approval."));
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getMyRole());
        return ResponseEntity.ok(buildAuthResponse(user, token));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        String password = data.get("password");
        String role = data.get("role");

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
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
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> data) {
        String idTokenString = data.get("token");

        if (googleClientId == null || googleClientId.isBlank()
                || googleClientId.equals("YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com")) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Google Client ID is not configured on the server."));
        }

        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Invalid Google ID token."));
            }

            Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String requestedRole = data.get("role");

            Optional<MyUsers> userOpt = userRepository.findByEmail(email);
            MyUsers user;

            if (userOpt.isPresent()) {
                user = userOpt.get();
                if ("Managing Staff".equals(requestedRole)
                        && !user.isOnboarded()
                        && !"Managing Staff".equals(user.getMyRole())) {
                    user.setMyRole("Managing Staff");
                    userRepository.save(user);
                }
            } else {
                // Block auto-registration for Admins
                if ("Managing Staff".equals(requestedRole)) {
                    return ResponseEntity.status(404).body(Map.of("message",
                            "No manager account found for this email. Please register your building first."));
                }

                user = new MyUsers();
                user.setEmail(email);
                user.setPassword("GOOGLE_AUTH_" + java.util.UUID.randomUUID());
                user.setMyRole(requestedRole != null ? requestedRole : "Resident");
                user.setOnboarded(false);
                user.setApproved(false);
                userRepository.save(user);
            }

            // Google Login Security Gate
            if (user.isOnboarded() && !user.isApproved() && "Resident".equals(user.getMyRole())) {
                return ResponseEntity.status(403).body(Map.of("message", "Your account is pending admin approval."));
            }

            String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getMyRole());
            return ResponseEntity.ok(buildAuthResponse(user, token));

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Error verifying Google token: " + e.getMessage()));
        }
    }

    @PostMapping("/admin/onboarding")
    public ResponseEntity<?> adminOnboarding(@RequestBody Map<String, Object> data) {
        JwtPrincipal principal = getAuthenticatedPrincipal();
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }

        Optional<MyUsers> userOpt = userRepository.findById(principal.getUserId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }

        MyUsers user = userOpt.get();

        if (user.isOnboarded()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Account has already been onboarded"));
        }

        Property property = new Property();
        property.setName(data.get("propertyName").toString());
        property.setAddress(data.get("propertyAddress").toString());
        property.setPropertyType(data.get("propertyType").toString());
        property.setAdmin(user);
        property = propertyRepository.save(property);

        user.setMyRole("Managing Staff");
        user.setOnboarded(true);
        user.setApproved(true);
        user.setPropertyId(property.getId());
        userRepository.save(user);

        String newToken = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getMyRole());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Onboarding complete");
        response.put("propertyId", property.getId());
        response.put("isOnboarded", true);
        response.put("token", newToken);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/onboarding")
    public ResponseEntity<?> onboarding(@RequestBody Map<String, Object> data) {
        try {
            JwtPrincipal principal = getAuthenticatedPrincipal();
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
            }

            Optional<MyUsers> userOpt = userRepository.findById(principal.getUserId());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "User not found"));
            }

            Object rawPropertyId = data.get("propertyId");
            if (rawPropertyId == null || rawPropertyId.toString().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Property selection is required"));
            }

            Long propertyId;
            try {
                propertyId = Long.valueOf(rawPropertyId.toString());
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid property selection"));
            }

            MyUsers user = userOpt.get();
            user.setOnboarded(true);
            user.setPropertyId(propertyId);
            user.setFullName(safeGet(data, "name"));
            userRepository.save(user);

            residentService.registerResident(
                    principal.getUserId(),
                    safeGet(data, "name"),
                    user.getEmail(),
                    safeGet(data, "phone"),
                    safeGet(data, "ic"),
                    safeGet(data, "gender"),
                    safeGet(data, "address"),
                    safeGet(data, "room"),
                    propertyId);

            return ResponseEntity.ok(Map.of("message", "Onboarding complete"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Onboarding failed: " + e.getMessage()));
        }
    }

    private String safeGet(Map<String, Object> data, String key) {
        Object value = data.get(key);
        return value != null ? value.toString() : "";
    }

    @GetMapping("/properties")
    public List<Property> getProperties() {
        return propertyRepository.findAll();
    }

    private JwtPrincipal getAuthenticatedPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof JwtPrincipal principal) {
            return principal;
        }
        return null;
    }

    private Map<String, Object> buildAuthResponse(MyUsers user, String token) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("myRole", user.getMyRole());
        response.put("isOnboarded", user.isOnboarded());
        response.put("needsOnboarding", !user.isOnboarded()); // Added for frontend logic consistency
        response.put("isApproved", user.isApproved());
        response.put("createdAt", user.getCreatedAt());
        response.put("token", token);

        if (user.isOnboarded()) {
            response.put("propertyId", user.getPropertyId());
            response.put("name", "Admin");
        }

        return response;
    }
}
