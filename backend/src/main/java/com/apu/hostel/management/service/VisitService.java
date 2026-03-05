package com.apu.hostel.management.service;

import com.apu.hostel.management.model.Residents;
import com.apu.hostel.management.model.VisitRequest;
import com.apu.hostel.management.repository.ResidentRepository;
import com.apu.hostel.management.repository.VisitRequestRepository;
import com.apu.hostel.management.repository.VisitorDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class VisitService {

    @Autowired
    private VisitRequestRepository visitRequestRepository;

    @Autowired
    private ResidentRepository residentRepository;

    @Autowired
    private VisitorDetailsRepository visitorDetailsRepository;

    public List<VisitRequest> getRequestsByResident(Long residentId) {
        return visitRequestRepository.findByResidentId(residentId);
    }

    @Transactional
    public VisitRequest createVisitRequest(Long residentId, String residentName, String visitorName,
            String visitDate, String visitTime, String purpose) {

        Residents resident = residentRepository.findById(residentId)
                .orElseThrow(() -> new IllegalArgumentException("Resident profile not found."));

        VisitRequest visitRequest = new VisitRequest();
        visitRequest.setResident(resident);
        visitRequest.setResidentName(residentName);
        visitRequest.setVisitorName(visitorName);

        // Generate a simple unique 8-character code for the QR
        String visitCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        visitRequest.setVisitCode(visitCode);

        visitRequest.setVisitDate(visitDate);
        visitRequest.setVisitTime(visitTime);
        visitRequest.setPurpose(purpose);
        visitRequest.setStatus("Approved");

        return visitRequestRepository.save(visitRequest);
    }

    @Transactional
    public void updateStatus(Long id, String status) {
        VisitRequest request = visitRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Visit request not found."));
        request.setStatus(status);
        visitRequestRepository.save(request);
    }

    @Transactional
    public void deleteVisit(Long id) {
        VisitRequest request = visitRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Visit request not found."));

        // Find and delete associated details if they exist
        visitorDetailsRepository.findByVisitRequestId(id).ifPresent(details -> {
            visitorDetailsRepository.delete(details);
        });

        visitRequestRepository.delete(request);
    }

    public Optional<VisitRequest> findByResidentAndVisitCode(String residentName, String visitCode) {
        return visitRequestRepository.findByResidentNameAndVisitCode(residentName, visitCode);
    }

    public List<VisitRequest> getHistory() {
        return visitRequestRepository.findAll();
    }
}
