package com.apu.hostel.management.service;

import com.apu.hostel.management.model.*;
import com.apu.hostel.management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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

    @Transactional
    public boolean verifyVisitor(Long staffId, String residentName, String visitorUsername, String password) {
        Optional<VisitRequest> requestOpt = visitRequestRepository.findByResidentNameAndVisitorUsername(residentName,
                visitorUsername);

        if (requestOpt.isPresent()) {
            VisitRequest visitRequest = requestOpt.get();
            if (visitRequest.getVisitorPassword().equals(password)) {

                SecurityStaff staff = securityStaffRepository.findById(staffId)
                        .orElseThrow(() -> new IllegalArgumentException("Staff member not found."));

                // Log verification
                VerifiedVisitors verification = new VerifiedVisitors();
                verification.setSecurityStaff(staff);
                verification.setResidentName(residentName);
                verification.setVisitorUsername(visitorUsername);
                verification.setVisitorPassword(password);
                verification.setStatus("Verified");
                verifiedVisitorsRepository.save(verification);

                // Update request
                visitRequest.setStatus("Approved");
                visitRequestRepository.save(visitRequest);

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

    public Optional<VerifiedVisitors> findLastVerifiedByUsername(String visitorUsername) {
        return verifiedVisitorsRepository.findAll().stream()
                .filter(v -> v.getVisitorUsername().equals(visitorUsername))
                .reduce((first, second) -> second);
    }

    @Transactional
    public void logVisitorDetailsByUsername(String visitorUsername, String name, String email, String phone,
            String ic, String gender, String address) {

        VerifiedVisitors verification = findLastVerifiedByUsername(visitorUsername)
                .orElseThrow(() -> new IllegalArgumentException("No verification found for this visitor."));

        VisitRequest visitRequest = visitRequestRepository.findByResidentNameAndVisitorUsername(
                verification.getResidentName(), visitorUsername)
                .orElseThrow(() -> new IllegalArgumentException("Visit request not found."));

        logVisitorDetails(visitRequest.getId(), name, email, phone, ic, gender, address);
    }
}
