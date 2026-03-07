package com.apu.hostel.management.service;

import com.apu.hostel.management.model.Residents;
import com.apu.hostel.management.model.VisitRequest;
import com.apu.hostel.management.repository.ResidentRepository;
import com.apu.hostel.management.repository.VisitRequestRepository;
import com.apu.hostel.management.repository.VisitorDetailsRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VisitServiceTest {

    @Mock
    private VisitRequestRepository visitRequestRepository;

    @Mock
    private ResidentRepository residentRepository;

    @Mock
    private VisitorDetailsRepository visitorDetailsRepository;

    @InjectMocks
    private VisitService visitService;

    // ✅ TEST 1: Successfully creates a visit request
    @Test
    void createVisitRequest_ShouldSucceed_WhenResidentExists() {
        // ARRANGE — set up fake data
        Long residentId = 1L;
        Residents fakeResident = new Residents();
        fakeResident.setId(residentId);

        VisitRequest savedRequest = new VisitRequest();
        savedRequest.setId(1L);
        savedRequest.setVisitorName("John Doe");

        when(residentRepository.findById(residentId)).thenReturn(Optional.of(fakeResident));
        when(visitRequestRepository.save(any(VisitRequest.class))).thenReturn(savedRequest);

        // ACT — call the real method
        VisitRequest result = visitService.createVisitRequest(
                residentId, "Jane Resident", "John Doe",
                "2025-01-01", "10:00", "Friendly visit");

        // ASSERT — check results
        assertNotNull(result);
        assertEquals("John Doe", result.getVisitorName());
        verify(visitRequestRepository, times(1)).save(any(VisitRequest.class));
    }

    // ❌ TEST 2: Throws exception when resident not found
    @Test
    void createVisitRequest_ShouldThrow_WhenResidentNotFound() {
        // ARRANGE
        when(residentRepository.findById(99L)).thenReturn(Optional.empty());

        // ACT & ASSERT
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> visitService.createVisitRequest(
                        99L, "Nobody", "John Doe",
                        "2025-01-01", "10:00", "Visit"));

        assertEquals("Resident profile not found.", exception.getMessage());
    }

    // ✅ TEST 3: Successfully updates visit status
    @Test
    void updateStatus_ShouldSucceed_WhenVisitExists() {
        // ARRANGE
        VisitRequest existingRequest = new VisitRequest();
        existingRequest.setId(1L);
        existingRequest.setStatus("Approved");

        when(visitRequestRepository.findById(1L)).thenReturn(Optional.of(existingRequest));
        when(visitRequestRepository.save(any(VisitRequest.class))).thenReturn(existingRequest);

        // ACT
        visitService.updateStatus(1L, "Completed");

        // ASSERT
        assertEquals("Completed", existingRequest.getStatus());
        verify(visitRequestRepository, times(1)).save(existingRequest);
    }

    // ❌ TEST 4: Throws exception when updating non-existent visit
    @Test
    void updateStatus_ShouldThrow_WhenVisitNotFound() {
        when(visitRequestRepository.findById(99L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> visitService.updateStatus(99L, "Completed"));

        assertEquals("Visit request not found.", exception.getMessage());
    }
}