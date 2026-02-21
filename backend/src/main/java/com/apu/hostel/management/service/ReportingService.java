package com.apu.hostel.management.service;

import com.apu.hostel.management.repository.ResidentRepository;
import com.apu.hostel.management.repository.SecurityStaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportingService {

    @Autowired
    private ResidentRepository residentRepository;

    @Autowired
    private SecurityStaffRepository securityStaffRepository;

    public List<Object[]> getResidentGenderReport() {
        return residentRepository.countByGender();
    }

    public List<Object[]> getResidentApprovalReport() {
        return residentRepository.countByApprovalStatus();
    }

    public long getTotalResidents() {
        return residentRepository.count();
    }

    public List<Object[]> getSecurityGenderReport() {
        return securityStaffRepository.countByGender();
    }

    public long getTotalSecurityStaff() {
        return securityStaffRepository.count();
    }
}
