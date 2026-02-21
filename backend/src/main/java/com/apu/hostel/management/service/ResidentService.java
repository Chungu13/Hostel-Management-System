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
    public Residents registerResident(String username, String name, String email, String phone, String ic,
            String gender, String address, String room, Long propertyId) {
        MyUsers user = userRepository.findByUserName(username)
                .orElseThrow(() -> new IllegalArgumentException("User account not found."));

        com.apu.hostel.management.model.Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found."));

        Residents resident = new Residents(user, name, email, phone, ic, gender, address, room, property);
        return residentRepository.save(resident);
    }

    public List<Residents> getAllResidents() {
        return residentRepository.findAll();
    }
}
