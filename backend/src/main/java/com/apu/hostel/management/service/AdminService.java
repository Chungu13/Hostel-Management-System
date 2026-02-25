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
    public void updateResident(Long id, String name, String email, String phone, String gender, String address,
            boolean approved) {
        Residents resident = residentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resident not found."));

        if (name != null)
            resident.setName(name);
        if (email != null)
            resident.setEmail(email);
        if (phone != null)
            resident.setPhone(phone);
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
            userRepository.save(user);
        }
    }

    @Transactional
    public void deleteResident(Long id) {
        residentRepository.findById(id).ifPresent(r -> residentRepository.delete(r));
        userRepository.findById(id).ifPresent(user -> userRepository.delete(user));
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
    public SecurityStaff registerStaff(Long userId, String name, String email, String phone, String ic,
            String gender, String address, Long propertyId) {
        MyUsers user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User account not found."));

        com.apu.hostel.management.model.Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found."));

        SecurityStaff staff = new SecurityStaff(user, name, email, phone, ic, gender, address, property);
        if (staff.getAddress() == null || staff.getAddress().isBlank()) {
            staff.setAddress("Property Resident");
        }
        return staffRepository.save(staff);
    }

    @Transactional
    public void updateStaff(Long id, String name, String email, String phone, String gender, String address) {
        SecurityStaff staff = staffRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found."));
        staff.setName(name);
        staff.setEmail(email);
        staff.setPhone(phone);
        staff.setGender(gender);
        if (address != null) {
            staff.setAddress(address);
        } else if (staff.getAddress() == null) {
            staff.setAddress("Property Resident");
        }
        staffRepository.save(staff);
    }

    @Transactional
    public void deleteStaff(Long id) {
        staffRepository.findById(id).ifPresent(s -> staffRepository.delete(s));
        userRepository.findById(id).ifPresent(user -> userRepository.delete(user));
    }
}
