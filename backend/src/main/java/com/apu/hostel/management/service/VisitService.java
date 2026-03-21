package com.apu.hostel.management.service;

import com.apu.hostel.management.model.Residents;
import com.apu.hostel.management.model.VisitRequest;
import com.apu.hostel.management.repository.ResidentRepository;
import com.apu.hostel.management.repository.VisitRequestRepository;
import com.apu.hostel.management.repository.VisitorDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
public class VisitService {

    @Autowired
    private VisitRequestRepository visitRequestRepository;

    @Autowired
    private ResidentRepository residentRepository;

    @Autowired
    private VisitorDetailsRepository visitorDetailsRepository;

    public Page<VisitRequest> getRequestsByResident(Long residentId, java.time.LocalDateTime clearedAt,
            Pageable pageable) {
        try {
            if (clearedAt == null) {
                return visitRequestRepository.findByResidentId(residentId, pageable);
            }
            return visitRequestRepository.findByResidentIdAndAfter(residentId, clearedAt, pageable);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to load resident visit requests: " + e.getMessage(), e);
        }
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

    public List<VisitRequest> getHistory(LocalDateTime clearedAt) {
        try {
            List<VisitRequest> all = visitRequestRepository.findAll();
            if (clearedAt == null)
                return all;
            return all.stream()
                    .filter(r -> r.getRequestDate() != null && r.getRequestDate().isAfter(clearedAt))
                    .collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to load system visit history: " + e.getMessage(), e);
        }
    }

    public Page<VisitRequest> getAllHistoryAdmin(Pageable pageable) {
        try {
            return visitRequestRepository.findAll(pageable);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to load admin visit history: " + e.getMessage(), e);
        }
    }
}
