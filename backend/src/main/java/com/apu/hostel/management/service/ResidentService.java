package com.apu.hostel.management.service;

import com.apu.hostel.management.model.MyUsers;
import com.apu.hostel.management.model.Residents;
import com.apu.hostel.management.repository.ResidentRepository;
import com.apu.hostel.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ResidentService {

    @Autowired
    private ResidentRepository residentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.apu.hostel.management.repository.PropertyRepository propertyRepository;

    public List<MyUsers> getAvailableResidents() {
        return userRepository.findAvailableResidents("Resident");
    }

    @Transactional
    public Residents registerResident(Long residentId, String name, String email, String phone, String ic,
            String gender, String address, String room, Long propertyId) {
        MyUsers user = userRepository.findById(residentId)
                .orElseThrow(() -> new IllegalArgumentException("User account not found."));

        com.apu.hostel.management.model.Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found."));

        // Title Case Formatting
        String formattedName = (name == null || name.isBlank()) ? ""
                : java.util.Arrays.stream(name.trim().split("\\s+"))
                        .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
                        .collect(java.util.stream.Collectors.joining(" "));

        // Zambian Phone Formatting
        String phoneDigits = phone.replaceAll("\\D", "");
        String formattedPhone = phoneDigits.startsWith("260") ? "+" + phoneDigits : "+260" + phoneDigits;

        // Zambian NRC Formatting
        String icDigits = ic.replaceAll("\\D", "");
        String formattedIc = ic;
        if (icDigits.length() == 9) {
            formattedIc = icDigits.substring(0, 6) + "/" + icDigits.substring(6, 8) + "/" + icDigits.substring(8);
        }

        Residents resident = new Residents(user, formattedName, email, formattedPhone, formattedIc, gender, address,
                room, property);
        if (resident.getAddress() == null || resident.getAddress().isBlank()) {
            resident.setAddress("Property Resident");
        }

        // Update user full name as well
        user.setFullName(formattedName);
        userRepository.save(user);

        return residentRepository.save(resident);
    }

    public List<Residents> getAllResidents() {
        return residentRepository.findAll();
    }
}
