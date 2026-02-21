package com.apu.hostel.management.service;

import com.apu.hostel.management.model.MyUsers;
import com.apu.hostel.management.model.SecurityStaff;
import com.apu.hostel.management.repository.SecurityStaffRepository;
import com.apu.hostel.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StaffService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SecurityStaffRepository securityStaffRepository;

    public List<MyUsers> getAvailableSecurityStaff() {
        return userRepository.findAvailableSecurityStaff("Security Staff");
    }

    @Transactional
    public SecurityStaff registerSecurityStaff(String username, String name, String email, String phone, String ic,
            String gender, String address) {
        MyUsers user = userRepository.findByUserName(username)
                .orElseThrow(() -> new IllegalArgumentException("Selected user not found."));

        SecurityStaff staff = new SecurityStaff();
        staff.setMyUser(user);
        staff.setUsername(user.getUserName());
        staff.setName(name);
        staff.setEmail(email);
        staff.setPhone(phone);
        staff.setIc(ic);
        staff.setGender(gender);
        staff.setAddress(address);
        staff.setApproved(true);

        return securityStaffRepository.save(staff);
    }
}
