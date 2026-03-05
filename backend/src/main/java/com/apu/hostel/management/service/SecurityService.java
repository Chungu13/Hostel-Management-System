package com.apu.hostel.management.service;

import com.apu.hostel.management.model.*;
import com.apu.hostel.management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SecurityService {

    @Autowired
    private SecurityStaffRepository securityStaffRepository;

    @Autowired
    private VerifiedVisitorsRepository verifiedVisitorsRepository;

    @Autowired
    private VisitRequestRepository visitRequestRepository;

    @Autowired
    private VisitorDetailsRepository visitorDetailsRepository;

    public Optional<VisitRequest> getVisitByCode(String visitCode) {
        return visitRequestRepository.findByVisitCode(visitCode);
    }

    @Transactional
    public boolean verifyVisitor(Long staffId, String visitCode) {
        Optional<VisitRequest> requestOpt = visitRequestRepository.findByVisitCode(visitCode);

        if (requestOpt.isPresent()) {
            VisitRequest visitRequest = requestOpt.get();

            // Check if we already logged this verification recently
            Optional<VerifiedVisitors> existingLog = findLastVerifiedByCode(visitCode);
            boolean alreadyLoggedRecently = existingLog.isPresent() &&
                    existingLog.get().getVerifiedAt().isAfter(java.time.LocalDateTime.now().minusHours(24));

            if (!alreadyLoggedRecently) {
                SecurityStaff staff = securityStaffRepository.findById(staffId)
                        .orElseThrow(() -> new IllegalArgumentException("Staff member not found."));

                // Log verification
                VerifiedVisitors verification = new VerifiedVisitors();
                verification.setSecurityStaff(staff);
                verification.setResidentName(visitRequest.getResidentName());
                verification.setVisitCode(visitCode);
                verification.setStatus("Verified");
                verifiedVisitorsRepository.save(verification);

                // Update request status if not already
                if (!"Verified".equals(visitRequest.getStatus())) {
                    visitRequest.setStatus("Verified");
                    visitRequestRepository.save(visitRequest);
                }

                return true;
            } else if ("Verified".equals(visitRequest.getStatus())) {
                // If it was already logged recently and is verified, we still return true to
                // show success
                return true;
            }
        }
        return false;
    }

    @Transactional
    public void logVisitorDetails(long requestId, String name, String email, String phone, String ic, String gender,
            String address) {
        VisitRequest visitRequest = visitRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Visit request not found."));

        VisitorDetails details = new VisitorDetails();
        details.setVisitRequest(visitRequest);
        details.setVisitorName(name);
        details.setEmail(email);
        details.setPhone(phone);
        details.setIc(ic);
        details.setGender(gender);
        details.setAddress(address);

        visitorDetailsRepository.save(details);
    }

    public List<VerifiedVisitors> getVerificationHistory() {
        return verifiedVisitorsRepository.findAll();
    }

    public Optional<VerifiedVisitors> findLastVerifiedByCode(String visitCode) {
        return verifiedVisitorsRepository.findAll().stream()
                .filter(v -> v.getVisitCode().equals(visitCode))
                .reduce((first, second) -> second);
    }

    @Transactional
    public void logVisitorDetailsByCode(String visitCode, String name, String email, String phone,
            String ic, String gender, String address) {

        findLastVerifiedByCode(visitCode)
                .orElseThrow(() -> new IllegalArgumentException("No verification found for this code."));

        VisitRequest visitRequest = visitRequestRepository.findByVisitCode(visitCode)
                .orElseThrow(() -> new IllegalArgumentException("Visit request not found."));

        logVisitorDetails(visitRequest.getId(), name, email, phone, ic, gender, address);
    }

    @Transactional
    public boolean toggleDutyStatus(Long staffId) {
        SecurityStaff staff = securityStaffRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found."));
        staff.setOnDuty(!staff.isOnDuty());
        securityStaffRepository.save(staff);
        return staff.isOnDuty();
    }

    public List<SecurityStaff> getOnDutyStaff(Long propertyId) {
        return securityStaffRepository.findByPropertyIdAndOnDuty(propertyId, true);
    }

    public SecurityStaff getStaffById(Long staffId) {
        return securityStaffRepository.findById(staffId).orElse(null);
    }

    public Map<String, Object> getDashboardStats() {
        // Use a 24-hour window to be safer with timezones
        java.time.LocalDateTime twentyFourHoursAgo = java.time.LocalDateTime.now().minusHours(24);

        long todayVerified = verifiedVisitorsRepository.countByVerifiedAtAfter(twentyFourHoursAgo);

        List<VerifiedVisitors> recentLogs = verifiedVisitorsRepository.findFirst5ByOrderByIdDesc();

        System.out.println("Stats Fetch - Today count: " + todayVerified + " | Total logs found: " + recentLogs.size());

        return Map.of(
                "todayVerified", todayVerified,
                "currentInBuilding", todayVerified, // Placeholder
                "recentActivity", recentLogs);
    }
}
