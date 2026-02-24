package com.apu.hostel.management.service;

import com.apu.hostel.management.model.Residents;
import com.apu.hostel.management.model.VisitRequest;
import com.apu.hostel.management.repository.ResidentRepository;
import com.apu.hostel.management.repository.VisitRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class VisitService {

    @Autowired
    private VisitRequestRepository visitRequestRepository;

    @Autowired
    private ResidentRepository residentRepository;

    public List<VisitRequest> getRequestsByResident(Long residentId) {
        return visitRequestRepository.findByResidentId(residentId);
    }

    @Transactional
    public VisitRequest createVisitRequest(Long residentId, String residentName, String visitorName,
            String visitorUsername, String visitorPassword) {
        Residents resident = residentRepository.findById(residentId)
                .orElseThrow(() -> new IllegalArgumentException("Resident profile not found."));

        VisitRequest visitRequest = new VisitRequest();
        visitRequest.setResident(resident);
        visitRequest.setResidentName(residentName);
        visitRequest.setVisitorName(visitorName);
        visitRequest.setVisitorUsername(visitorUsername);
        visitRequest.setVisitorPassword(visitorPassword);
        visitRequest.setStatus("Pending");

        return visitRequestRepository.save(visitRequest);
    }

    @Transactional
    public void updateStatus(Long id, String status) {
        VisitRequest request = visitRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Visit request not found."));
        request.setStatus(status);
        visitRequestRepository.save(request);
    }

    public Optional<VisitRequest> findByResidentAndVisitor(String residentName, String visitorUsername) {
        return visitRequestRepository.findByResidentNameAndVisitorUsername(residentName, visitorUsername);
    }

    public List<VisitRequest> getHistory() {
        return visitRequestRepository.findAll();
    }
}
