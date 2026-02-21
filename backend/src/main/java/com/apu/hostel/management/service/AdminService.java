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

    // --- Resident Logic ---
    public List<Residents> searchResidents(Long propertyId, String type, String value) {
        // Simple implementation: filter all then search. In production, use Repository
        // queries with propertyId.
        List<Residents> all = residentRepository.findAll().stream()
                .filter(r -> r.getProperty() != null && r.getProperty().getId().equals(propertyId))
                .toList();

        if (value == null || value.trim().isEmpty())
            return all;

        switch (type) {
            case "name":
                return all.stream().filter(r -> r.getName().toLowerCase().contains(value.toLowerCase())).toList();
            case "email":
                return all.stream().filter(r -> r.getEmail().equalsIgnoreCase(value)).toList();
            default:
                return all;
        }
    }

    @Transactional
    public void updateResident(String username, String name, String email, String phone, String gender, String address,
            boolean approved) {
        Residents resident = residentRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Resident not found."));
        resident.setName(name);
        resident.setEmail(email);
        resident.setPhone(phone);
        resident.setGender(gender);
        resident.setAddress(address);
        resident.setApproved(approved);
        residentRepository.save(resident);
    }

    @Transactional
    public void deleteResident(String username) {
        residentRepository.findByUsername(username).ifPresent(r -> residentRepository.delete(r));
        userRepository.findByUserName(username).ifPresent(user -> userRepository.delete(user));
    }

    // --- Staff Logic ---
    public List<SecurityStaff> searchStaff(Long propertyId, String type, String value) {
        List<SecurityStaff> all = staffRepository.findAll().stream()
                .filter(s -> s.getProperty() != null && s.getProperty().getId().equals(propertyId))
                .toList();

        if (value == null || value.trim().isEmpty())
            return all;

        switch (type) {
            case "name":
                return all.stream().filter(s -> s.getName().toLowerCase().contains(value.toLowerCase())).toList();
            default:
                return all;
        }
    }

    @Transactional
    public SecurityStaff registerStaff(String username, String name, String email, String phone, String ic,
            String gender, String address, Long propertyId) {
        MyUsers user = userRepository.findByUserName(username)
                .orElseThrow(() -> new IllegalArgumentException("User account not found."));

        com.apu.hostel.management.model.Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found."));

        SecurityStaff staff = new SecurityStaff(user, name, email, phone, ic, gender, address, property);
        return staffRepository.save(staff);
    }

    @Transactional
    public void updateStaff(String username, String name, String email, String phone, String gender, String address) {
        SecurityStaff staff = staffRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found."));
        staff.setName(name);
        staff.setEmail(email);
        staff.setPhone(phone);
        staff.setGender(gender);
        staff.setAddress(address);
        staffRepository.save(staff);
    }

    @Transactional
    public void deleteStaff(String username) {
        staffRepository.findByUsername(username).ifPresent(s -> staffRepository.delete(s));
        userRepository.findByUserName(username).ifPresent(user -> userRepository.delete(user));
    }
}
