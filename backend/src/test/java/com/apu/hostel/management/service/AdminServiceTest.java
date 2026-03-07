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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private ResidentRepository residentRepository;

    @Mock
    private SecurityStaffRepository staffRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private com.apu.hostel.management.repository.PropertyRepository propertyRepository;

    @Mock
    private com.apu.hostel.management.repository.VisitRequestRepository visitRequestRepository;

    @InjectMocks
    private AdminService adminService;

    // ✅ TEST 1: Search residents returns paged results
    @Test
    void searchResidents_ShouldReturnPaged_WhenNoFilterValue() {
        Property property = new Property();
        property.setId(1L);

        Residents r1 = new Residents();
        r1.setProperty(property);

        Residents r2 = new Residents();
        r2.setProperty(property);

        PageRequest pageable = PageRequest.of(0, 10);
        when(residentRepository.findByPropertyId(1L, pageable))
                .thenReturn(new PageImpl<>(List.of(r1, r2)));

        Page<Residents> result = adminService.searchResidents(1L, "name", "", pageable);

        assertEquals(2, result.getTotalElements());
    }

    // ✅ TEST 2: Search residents filters by name with pagination
    @Test
    void searchResidents_ShouldFilterByName_Paged() {
        Property property = new Property();
        property.setId(1L);

        Residents r1 = new Residents();
        r1.setProperty(property);
        r1.setName("John Doe");

        PageRequest pageable = PageRequest.of(0, 10);
        when(residentRepository.findByNameContainingIgnoreCaseAndPropertyId("john", 1L, pageable))
                .thenReturn(new PageImpl<>(List.of(r1)));

        Page<Residents> result = adminService.searchResidents(1L, "name", "john", pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("John Doe", result.getContent().get(0).getName());
    }

    // ❌ TEST 3: Update resident throws when not found
    @Test
    void updateResident_ShouldThrow_WhenResidentNotFound() {
        when(residentRepository.findById(99L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> adminService.updateResident(
                        99L, "John", "john@email.com",
                        "0971234567", "123456/78/9",
                        "Male", "123 Street", true));

        assertEquals("Resident not found.", exception.getMessage());
    }

    // ✅ TEST 4: Delete resident removes visit requests and user
    @Test
    void deleteResident_ShouldDeleteVisitsAndUser() {
        VisitRequest vr = new VisitRequest();
        when(visitRequestRepository.findByResidentId(1L)).thenReturn(List.of(vr));
        when(residentRepository.findById(1L)).thenReturn(Optional.of(new Residents()));
        when(userRepository.findById(1L)).thenReturn(Optional.of(new MyUsers()));

        adminService.deleteResident(1L);

        verify(visitRequestRepository, times(1)).deleteAll(any());
        verify(residentRepository, times(1)).delete(any());
        verify(userRepository, times(1)).delete(any());
    }

    // ❌ TEST 5: Register staff throws when user not found
    @Test
    void registerStaff_ShouldThrow_WhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> adminService.registerStaff(
                        99L, "John Doe", "john@email.com",
                        "0971234567", "123456/78/9",
                        "Male", "123 Street", 1L));

        assertEquals("User account not found.", exception.getMessage());
    }

    // ❌ TEST 6: Update staff throws when not found
    @Test
    void updateStaff_ShouldThrow_WhenStaffNotFound() {
        when(staffRepository.findById(99L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> adminService.updateStaff(
                        99L, "John", "john@email.com",
                        "0971234567", "123456/78/9",
                        "Male", "123 Street"));

        assertEquals("Staff member not found.", exception.getMessage());
    }
}