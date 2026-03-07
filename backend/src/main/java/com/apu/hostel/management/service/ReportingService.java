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

    @Autowired
    private com.apu.hostel.management.repository.VisitRequestRepository visitRequestRepository;

    public List<Object[]> getResidentGenderReport(Long propertyId) {
        return residentRepository.countByGenderAndPropertyId(propertyId);
    }

    public List<Object[]> getResidentApprovalReport(Long propertyId) {
        return residentRepository.countByApprovalStatusAndPropertyId(propertyId);
    }

    public long getTotalResidents(Long propertyId) {
        return residentRepository.countByPropertyId(propertyId);
    }

    public List<Object[]> getSecurityGenderReport(Long propertyId) {
        return securityStaffRepository.countByGenderAndPropertyId(propertyId);
    }

    public long getTotalSecurityStaff(Long propertyId) {
        return securityStaffRepository.countByPropertyId(propertyId);
    }

    public List<Object[]> getVisitStatusBreakdown(Long propertyId) {
        return visitRequestRepository.countByStatusAndPropertyId(propertyId);
    }

    public List<Object[]> getVisitsPerDayInMonth(Long propertyId, String monthPrefix) {
        return visitRequestRepository.countByDayInMonth(propertyId, monthPrefix);
    }

    public List<Object[]> getTopResidentsByVisitors(Long propertyId) {
        return visitRequestRepository.findTopResidentsByVisitors(propertyId);
    }

    public List<Object[]> getVisitsByDay(Long propertyId) {
        return visitRequestRepository.countByDateAndPropertyId(propertyId);
    }
}
