package com.apu.hostel.management.service;

import com.apu.hostel.management.model.*;
import com.apu.hostel.management.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SecurityServiceTest {

        @Mock
        private SecurityStaffRepository securityStaffRepository;

        @Mock
        private VerifiedVisitorsRepository verifiedVisitorsRepository;

        @Mock
        private VisitRequestRepository visitRequestRepository;

        @Mock
        private VisitorDetailsRepository visitorDetailsRepository;

        @InjectMocks
        private SecurityService securityService;

        // ✅ TEST 1: Successfully verifies a visitor with no previous verification
        @Test
        void verifyVisitor_ShouldReturnTrue_WhenVisitorNotYetVerified() {
                // ARRANGE
                VisitRequest visitRequest = new VisitRequest();
                visitRequest.setId(1L);
                visitRequest.setResidentName("Jane Resident");
                visitRequest.setStatus("Approved");

                SecurityStaff staff = new SecurityStaff();
                staff.setId(1L);

                when(visitRequestRepository.findByVisitCode("ABC123"))
                                .thenReturn(Optional.of(visitRequest));
                when(verifiedVisitorsRepository.findAll())
                                .thenReturn(List.of()); // no previous verifications
                when(securityStaffRepository.findById(1L))
                                .thenReturn(Optional.of(staff));
                when(verifiedVisitorsRepository.save(any())).thenReturn(new VerifiedVisitors());

                // ACT
                boolean result = securityService.verifyVisitor(1L, "ABC123");

                // ASSERT
                assertTrue(result);
                verify(verifiedVisitorsRepository, times(1)).save(any());
        }

        // ❌ TEST 2: Returns false when visit code does not exist
        @Test
        void verifyVisitor_ShouldReturnFalse_WhenVisitCodeNotFound() {
                when(visitRequestRepository.findByVisitCode("INVALID"))
                                .thenReturn(Optional.empty());

                boolean result = securityService.verifyVisitor(1L, "INVALID");

                assertFalse(result);
                verify(verifiedVisitorsRepository, never()).save(any());
        }

        // ✅ TEST 3: Returns true when visitor was already verified recently
        @Test
        void verifyVisitor_ShouldReturnTrue_WhenAlreadyVerifiedRecently() {
                VisitRequest visitRequest = new VisitRequest();
                visitRequest.setId(1L);
                visitRequest.setStatus("Verified");

                VerifiedVisitors recentLog = new VerifiedVisitors();
                recentLog.setVisitCode("ABC123");
                recentLog.setVerifiedAt(LocalDateTime.now().minusHours(1)); // 1 hour ago

                when(visitRequestRepository.findByVisitCode("ABC123"))
                                .thenReturn(Optional.of(visitRequest));
                when(verifiedVisitorsRepository.findAll())
                                .thenReturn(List.of(recentLog));

                boolean result = securityService.verifyVisitor(1L, "ABC123");

                assertTrue(result);
                verify(verifiedVisitorsRepository, never()).save(any()); // should NOT save again
        }

        // ✅ TEST 4: Successfully logs visitor details
        @Test
        void logVisitorDetails_ShouldSave_WhenVisitRequestExists() {
                VisitRequest visitRequest = new VisitRequest();
                visitRequest.setId(1L);

                when(visitRequestRepository.findById(1L))
                                .thenReturn(Optional.of(visitRequest));

                securityService.logVisitorDetails(
                                1L, "John Doe", "john@email.com",
                                "0123456789", "991234567890", "Male", "123 Street");

                verify(visitorDetailsRepository, times(1)).save(any(VisitorDetails.class));
        }

        // ❌ TEST 5: Throws exception when logging details for non-existent visit
        @Test
        void logVisitorDetails_ShouldThrow_WhenVisitRequestNotFound() {
                when(visitRequestRepository.findById(99L))
                                .thenReturn(Optional.empty());

                IllegalArgumentException exception = assertThrows(
                                IllegalArgumentException.class,
                                () -> securityService.logVisitorDetails(
                                                99L, "John Doe", "john@email.com",
                                                "0123456789", "991234567890", "Male", "123 Street"));

                assertEquals("Visit request not found.", exception.getMessage());
        }

        // ✅ TEST 6: Toggle duty status from false to true
        @Test
        void toggleDutyStatus_ShouldToggle_WhenStaffExists() {
                SecurityStaff staff = new SecurityStaff();
                staff.setId(1L);
                staff.setOnDuty(false); // currently off duty

                when(securityStaffRepository.findById(1L))
                                .thenReturn(Optional.of(staff));

                boolean result = securityService.toggleDutyStatus(1L);

                assertTrue(result); // should now be on duty
                verify(securityStaffRepository, times(1)).save(staff);
        }

        // ❌ TEST 7: Throws exception when toggling duty for non-existent staff
        @Test
        void toggleDutyStatus_ShouldThrow_WhenStaffNotFound() {
                when(securityStaffRepository.findById(99L))
                                .thenReturn(Optional.empty());

                IllegalArgumentException exception = assertThrows(
                                IllegalArgumentException.class,
                                () -> securityService.toggleDutyStatus(99L));

                assertEquals("Staff member not found.", exception.getMessage());
        }

        // ✅ TEST 8: Returns paged history when clearedAt is null
        @Test
        void getVerificationHistory_ShouldReturnPaged_WhenClearedAtIsNull() {
                VerifiedVisitors v1 = new VerifiedVisitors();
                VerifiedVisitors v2 = new VerifiedVisitors();

                PageRequest pageable = PageRequest.of(0, 10);
                when(verifiedVisitorsRepository.findByPropertyIdAndVerifiedAtAfter(anyLong(), any(), eq(pageable)))
                                .thenReturn(new PageImpl<>(List.of(v1, v2)));

                Page<VerifiedVisitors> result = securityService.getVerificationHistory(1L, null, pageable);

                assertEquals(2, result.getTotalElements());
        }

        // ✅ TEST 9: Filters history correctly when clearedAt is provided
        @Test
        void getVerificationHistory_ShouldFilter_WhenClearedAtIsProvided() {
                LocalDateTime clearedAt = LocalDateTime.now().minusHours(2);
                VerifiedVisitors recent = new VerifiedVisitors();

                PageRequest pageable = PageRequest.of(0, 10);
                when(verifiedVisitorsRepository.findByPropertyIdAndVerifiedAtAfter(eq(1L), eq(clearedAt), eq(pageable)))
                                .thenReturn(new PageImpl<>(List.of(recent)));

                Page<VerifiedVisitors> result = securityService.getVerificationHistory(1L, clearedAt, pageable);

                assertEquals(1, result.getTotalElements());
        }
}