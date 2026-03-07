package com.apu.hostel.management.service;

import com.apu.hostel.management.model.MyUsers;
import com.apu.hostel.management.model.Residents;
import com.apu.hostel.management.model.SecurityStaff;
import com.apu.hostel.management.repository.ResidentRepository;
import com.apu.hostel.management.repository.SecurityStaffRepository;
import com.apu.hostel.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Service
public class AdminService {

    @Autowired
    private ResidentRepository residentRepository;

    @Autowired
    private SecurityStaffRepository staffRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.apu.hostel.management.repository.PropertyRepository propertyRepository;

    @Autowired
    private com.apu.hostel.management.repository.VisitRequestRepository visitRequestRepository;

    // --- Resident Logic ---
    public Page<Residents> searchResidents(Long propertyId, String type, String value, Pageable pageable) {
        if (value == null || value.trim().isEmpty()) {
            return residentRepository.findByPropertyId(propertyId, pageable);
        }

        switch (type) {
            case "name":
                return residentRepository.findByNameContainingIgnoreCaseAndPropertyId(value, propertyId, pageable);
            default:
                return residentRepository.findByPropertyId(propertyId, pageable);
        }
    }

    @Transactional
    public void updateResident(Long id, String name, String email, String phone, String ic, String gender,
            String address,
            boolean approved) {
        Residents resident = residentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resident not found."));

        if (name != null) {
            // Title Case Formatting
            String formattedName = java.util.Arrays.stream(name.trim().split("\\s+"))
                    .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
                    .collect(java.util.stream.Collectors.joining(" "));
            resident.setName(formattedName);
        }

        if (email != null) {
            residentRepository.findByEmail(email).ifPresent(r -> {
                if (!r.getId().equals(id))
                    throw new RuntimeException("Email " + email + " is already taken.");
            });
            resident.setEmail(email);
        }

        if (phone != null) {
            String phoneDigits = phone.replaceAll("\\D", "");
            String formattedPhone = phoneDigits.startsWith("260") ? "+" + phoneDigits : "+260" + phoneDigits;
            residentRepository.findByPhone(formattedPhone).ifPresent(r -> {
                if (!r.getId().equals(id))
                    throw new RuntimeException("Phone " + formattedPhone + " is already taken.");
            });
            resident.setPhone(formattedPhone);
        }

        if (ic != null) {
            residentRepository.findByIc(ic).ifPresent(r -> {
                if (!r.getId().equals(id))
                    throw new RuntimeException("NRC " + ic + " is already taken.");
            });
            resident.setIc(ic);
        }

        if (gender != null)
            resident.setGender(gender);
        if (address != null) {
            resident.setAddress(address);
        } else if (resident.getAddress() == null) {
            resident.setAddress("Property Resident");
        }

        resident.setApproved(approved);
        residentRepository.save(resident);

        // Also update the MyUsers entry for login permission
        MyUsers user = resident.getMyUser();
        if (user != null) {
            user.setApproved(approved);
            if (resident.getName() != null)
                user.setFullName(resident.getName());
            if (resident.getEmail() != null)
                user.setEmail(resident.getEmail());
            if (resident.getPhone() != null)
                user.setPhone(resident.getPhone());
            if (resident.getIc() != null)
                user.setIc(resident.getIc());
            userRepository.save(user);
        }
    }

    @Transactional
    public void deleteResident(Long id) {
        // 1. Delete associated visit requests first (due to foreign key constraints)
        List<com.apu.hostel.management.model.VisitRequest> requests = visitRequestRepository.findByResidentId(id);
        if (!requests.isEmpty()) {
            visitRequestRepository.deleteAll(requests);
        }

        // 2. Delete the resident profile
        residentRepository.findById(id).ifPresent(r -> residentRepository.delete(r));

        // 3. Delete the core user account
        userRepository.findById(id).ifPresent(user -> userRepository.delete(user));
    }

    // --- Staff Logic ---
    public Page<SecurityStaff> searchStaff(Long propertyId, String type, String value, Pageable pageable) {
        if (value == null || value.trim().isEmpty()) {
            return staffRepository.findByPropertyId(propertyId, pageable);
        }

        switch (type) {
            case "name":
                return staffRepository.findByNameContainingIgnoreCaseAndPropertyId(value, propertyId, pageable);
            default:
                return staffRepository.findByPropertyId(propertyId, pageable);
        }
    }

    @Transactional
    public SecurityStaff registerStaff(Long userId, String name, String email, String phone, String ic,
            String gender, String address, Long propertyId) {
        MyUsers user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User account not found."));

        com.apu.hostel.management.model.Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found."));

        // Uniqueness checks
        staffRepository.findByEmail(email).ifPresent(s -> {
            throw new RuntimeException("A staff member with email " + email + " already exists.");
        });

        String phoneDigits = phone.replaceAll("\\D", "");
        String formattedPhone = phoneDigits.startsWith("260") ? "+" + phoneDigits : "+260" + phoneDigits;
        staffRepository.findByPhone(formattedPhone).ifPresent(s -> {
            throw new RuntimeException("A staff member with phone " + formattedPhone + " already exists.");
        });

        staffRepository.findByIc(ic).ifPresent(s -> {
            throw new RuntimeException("A staff member with NRC " + ic + " already exists.");
        });

        // Formatting
        String formattedName = (name == null || name.isBlank()) ? ""
                : java.util.Arrays.stream(name.trim().split("\\s+"))
                        .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
                        .collect(java.util.stream.Collectors.joining(" "));

        String icDigits = ic.replaceAll("\\D", "");
        String formattedIc = ic;
        if (icDigits.length() == 9) {
            formattedIc = icDigits.substring(0, 6) + "/" + icDigits.substring(6, 8) + "/" + icDigits.substring(8);
        }

        SecurityStaff staff = new SecurityStaff(user, formattedName, email, formattedPhone, formattedIc, gender,
                address, property);
        if (staff.getAddress() == null || staff.getAddress().isBlank()) {
            staff.setAddress("Property Resident");
        }
        return staffRepository.save(staff);
    }

    @Transactional
    public void updateStaff(Long id, String name, String email, String phone, String ic, String gender,
            String address) {
        SecurityStaff staff = staffRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found."));

        if (name != null) {
            String formattedName = java.util.Arrays.stream(name.trim().split("\\s+"))
                    .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
                    .collect(java.util.stream.Collectors.joining(" "));
            staff.setName(formattedName);
        }

        if (email != null) {
            staffRepository.findByEmail(email).ifPresent(s -> {
                if (!s.getId().equals(id))
                    throw new RuntimeException("Email " + email + " is already taken.");
            });
            staff.setEmail(email);
        }

        if (phone != null) {
            String phoneDigits = phone.replaceAll("\\D", "");
            String formattedPhone = phoneDigits.startsWith("260") ? "+" + phoneDigits : "+260" + phoneDigits;
            staffRepository.findByPhone(formattedPhone).ifPresent(s -> {
                if (!s.getId().equals(id))
                    throw new RuntimeException("Phone number " + formattedPhone + " is already taken.");
            });
            staff.setPhone(formattedPhone);
        }

        if (ic != null) {
            staffRepository.findByIc(ic).ifPresent(s -> {
                if (!s.getId().equals(id))
                    throw new RuntimeException("NRC " + ic + " is already taken.");
            });
            staff.setIc(ic);
        }

        staff.setGender(gender);
        if (address != null) {
            staff.setAddress(address);
        } else if (staff.getAddress() == null) {
            staff.setAddress("Property Resident");
        }
        staffRepository.save(staff);

        // Also update MyUsers
        MyUsers user = staff.getMyUser();
        if (user != null) {
            if (staff.getName() != null)
                user.setFullName(staff.getName());
            if (staff.getEmail() != null)
                user.setEmail(staff.getEmail());
            if (staff.getPhone() != null)
                user.setPhone(staff.getPhone());
            if (staff.getIc() != null)
                user.setIc(staff.getIc());
            userRepository.save(user);
        }
    }

    @Transactional
    public void deleteStaff(Long id) {
        staffRepository.findById(id).ifPresent(s -> staffRepository.delete(s));
        userRepository.findById(id).ifPresent(user -> userRepository.delete(user));
    }

    @Transactional
    public void handleAdminResidentRegistration(String email, String name, String phone, String ic, String gender,
            String address,
            String room, Long propertyId, boolean approved, String password) {

        // 1. Ensure user account exists
        MyUsers user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new MyUsers();
            user.setEmail(email);
            user.setPassword(password != null && !password.isBlank() ? password
                    : "TEMP_PASS_" + java.util.UUID.randomUUID().toString().substring(0, 8));
            user.setMyRole("Resident");
            user.setOnboarded(true);
            user.setApproved(approved);
            user.setFullName(name);
            user.setPhone(phone);
            user.setAddress(address);
            user.setIc(ic);
            user.setPropertyId(propertyId);
            user = userRepository.save(user);
        }

        // 2. Link or create Resident profile
        Residents resident = residentRepository.findById(user.getId()).orElse(null);
        if (resident == null) {
            // Use existing logic from registerResident if possible, or replicate here
            // Formatting
            String formattedName = (name == null || name.isBlank()) ? ""
                    : java.util.Arrays.stream(name.trim().split("\\s+"))
                            .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
                            .collect(java.util.stream.Collectors.joining(" "));

            String phoneDigits = phone.replaceAll("\\D", "");
            String formattedPhone = phoneDigits.startsWith("260") ? "+" + phoneDigits : "+260" + phoneDigits;

            // --- Uniqueness Checks ---
            residentRepository.findByIc(ic).ifPresent(r -> {
                throw new RuntimeException("A resident with NRC " + ic + " already exists.");
            });
            residentRepository.findByPhone(formattedPhone).ifPresent(r -> {
                throw new RuntimeException("A resident with phone " + formattedPhone + " already exists.");
            });

            com.apu.hostel.management.model.Property property = propertyRepository.findById(propertyId)
                    .orElseThrow(() -> new IllegalArgumentException("Property not found."));

            resident = new Residents(user, formattedName, email, formattedPhone, ic, gender, address, room, property);
            resident.setApproved(approved);
            residentRepository.save(resident);
        } else {
            // Update existing
            updateResident(resident.getId(), name, email, phone, ic, gender, address, approved);
        }
    }

    @Transactional
    public SecurityStaff handleAdminStaffRegistration(String email, String name, String phone, String ic, String gender,
            String address, Long propertyId, String password) {

        // 1. Ensure user account exists
        MyUsers user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new MyUsers();
            user.setEmail(email);
            user.setPassword(password != null && !password.isBlank() ? password
                    : "TEMP_PASS_" + java.util.UUID.randomUUID().toString().substring(0, 8));
            user.setMyRole("Security Staff");
            user.setOnboarded(true);
            user.setApproved(true);
            user.setFullName(name);
            user.setPhone(phone);
            user.setAddress(address);
            user.setIc(ic);
            user.setPropertyId(propertyId);
            user = userRepository.save(user);
        }

        // 2. Link or create Staff profile
        SecurityStaff staff = staffRepository.findById(user.getId()).orElse(null);
        if (staff == null) {
            return registerStaff(user.getId(), name, email, phone, ic, gender, address, propertyId);
        } else {
            updateStaff(staff.getId(), name, email, phone, ic, gender, address);
            return staff;
        }
    }
}
