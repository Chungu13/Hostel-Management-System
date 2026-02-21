package com.apu.hostel.management.controller;

import com.apu.hostel.management.model.MyUsers;
import com.apu.hostel.management.repository.UserRepository;
import com.apu.hostel.management.repository.ResidentRepository;
import com.apu.hostel.management.repository.SecurityStaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
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
public class RestAuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResidentRepository residentRepository;

    @Autowired
    private SecurityStaffRepository securityStaffRepository;

    @Autowired
    private com.apu.hostel.management.repository.PropertyRepository propertyRepository;

    @Autowired
    private com.apu.hostel.management.service.ResidentService residentService;

    @Value("${google.client.id}")
    private String googleClientId;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Optional<MyUsers> userOpt = userRepository.findByEmailAndPassword(email, password);

        if (userOpt.isPresent()) {
            MyUsers user = userOpt.get();
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("userName", user.getUserName());
            response.put("myRole", user.getMyRole());
            response.put("createdAt", user.getCreatedAt());

            // Try to find the name
            if (user.getUserName() != null) {
                if ("Resident".equals(user.getMyRole())) {
                    residentRepository.findByUsername(user.getUserName())
                            .ifPresent(r -> response.put("name", r.getName()));
                } else if ("Security Staff".equals(user.getMyRole())) {
                    securityStaffRepository.findByUsername(user.getUserName())
                            .ifPresent(s -> response.put("name", s.getName()));
                } else if ("Managing Staff".equals(user.getMyRole())) {
                    response.put("name", "Admin");
                    propertyRepository.findByAdmin(user).ifPresent(p -> response.put("propertyId", p.getId()));
                }
            } else {
                response.put("needsOnboarding", true);
            }

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        String password = data.get("password");
        String role = data.get("role");

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
        }

        MyUsers user = new MyUsers();
        user.setEmail(email);
        user.setPassword(password);
        user.setMyRole(role != null ? role : "Resident");
        userRepository.save(user);

        return ResponseEntity.ok(user);
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> data) {
        String idTokenString = data.get("token");

        NetHttpTransport transport = new NetHttpTransport();
        GsonFactory jsonFactory = GsonFactory.getDefaultInstance();

        System.out.println("Loaded googleClientId = [" + googleClientId + "]");

        if (googleClientId == null || googleClientId.isEmpty()
                || googleClientId.equals("YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com")) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Google Client ID is not configured on the server."));
        }

        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                Payload payload = idToken.getPayload();

                // Get profile information from payload
                String email = payload.getEmail();
                // String name = (String) payload.get("name");
                // String pictureUrl = (String) payload.get("picture");

                Optional<MyUsers> userOpt = userRepository.findByEmail(email);
                MyUsers user;

                if (userOpt.isPresent()) {
                    user = userOpt.get();
                } else {
                    // Register new user via Google
                    user = new MyUsers();
                    user.setEmail(email);
                    user.setPassword("GOOGLE_AUTH_" + java.util.UUID.randomUUID());
                    user.setMyRole("Resident");
                    userRepository.save(user);
                }

                Map<String, Object> response = new HashMap<>();
                response.put("id", user.getId());
                response.put("email", user.getEmail());
                response.put("userName", user.getUserName());
                response.put("myRole", user.getMyRole());
                response.put("createdAt", user.getCreatedAt());

                if (user.getUserName() != null) {
                    if ("Resident".equals(user.getMyRole())) {
                        residentRepository.findByUsername(user.getUserName())
                                .ifPresent(r -> response.put("name", r.getName()));
                    } else if ("Security Staff".equals(user.getMyRole())) {
                        securityStaffRepository.findByUsername(user.getUserName())
                                .ifPresent(s -> response.put("name", s.getName()));
                    } else {
                        response.put("name", "Admin");
                    }
                } else {
                    response.put("needsOnboarding", true);
                }

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(401).body(Map.of("message", "Invalid ID token."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Error verifying Google token: " + e.getMessage()));
        }
    }

    @GetMapping("/properties")
    public List<com.apu.hostel.management.model.Property> getProperties() {
        return propertyRepository.findAll();
    }

    @PostMapping("/onboarding")
    public ResponseEntity<?> onboarding(@RequestBody Map<String, Object> data) {
        Long userId = Long.valueOf(data.get("userId").toString());
        String username = data.get("userName").toString();
        Long propertyId = Long.valueOf(data.get("propertyId").toString());

        Optional<MyUsers> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty())
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        if (userRepository.findByUserName(username).isPresent())
            return ResponseEntity.badRequest().body(Map.of("message", "Username already exists"));

        MyUsers user = userOpt.get();
        user.setUserName(username);
        userRepository.save(user);

        residentService.registerResident(
                username,
                data.get("name").toString(),
                user.getEmail(),
                data.get("phone").toString(),
                data.get("ic").toString(),
                data.get("gender").toString(),
                data.get("address").toString(),
                data.get("room").toString(),
                propertyId);

        return ResponseEntity.ok(Map.of("message", "Onboarding complete", "user", user));
    }

    @PostMapping("/admin/onboarding")
    public ResponseEntity<?> adminOnboarding(@RequestBody Map<String, Object> data) {
        Long userId = Long.valueOf(data.get("userId").toString());
        String username = data.get("userName").toString();

        Optional<MyUsers> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty())
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        if (userRepository.findByUserName(username).isPresent())
            return ResponseEntity.badRequest().body(Map.of("message", "Username already exists"));

        MyUsers user = userOpt.get();
        user.setUserName(username);
        userRepository.save(user);

        com.apu.hostel.management.model.Property property = new com.apu.hostel.management.model.Property();
        property.setName(data.get("propertyName").toString());
        property.setAddress(data.get("propertyAddress").toString());
        property.setPropertyType(data.get("propertyType").toString());
        property.setAdmin(user);
        propertyRepository.save(property);

        return ResponseEntity.ok(Map.of("message", "Admin onboarding complete", "user", user));
    }
}
