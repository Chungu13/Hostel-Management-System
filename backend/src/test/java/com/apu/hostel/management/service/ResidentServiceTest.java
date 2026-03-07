package com.apu.hostel.management.service;

import com.apu.hostel.management.model.*;
import com.apu.hostel.management.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResidentServiceTest {

    @Mock
    private ResidentRepository residentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private com.apu.hostel.management.repository.PropertyRepository propertyRepository;

    @InjectMocks
    private ResidentService residentService;

    // ✅ TEST 1: Successfully registers a resident
    @Test
    void registerResident_ShouldSucceed_WhenUserAndPropertyExist() {
        MyUsers user = new MyUsers();
        user.setId(1L);

        Property property = new Property();
        property.setId(1L);

        Residents savedResident = new Residents();
        savedResident.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(residentRepository.save(any(Residents.class))).thenReturn(savedResident);

        Residents result = residentService.registerResident(
                1L, "john doe", "john@email.com",
                "0971234567", "123456/78/9", "Male",
                "123 Street", "Room 1", 1L);

        assertNotNull(result);
        verify(residentRepository, times(1)).save(any(Residents.class));
    }

    // ❌ TEST 2: Throws exception when user not found
    @Test
    void registerResident_ShouldThrow_WhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> residentService.registerResident(
                        99L, "John Doe", "john@email.com",
                        "0971234567", "123456/78/9", "Male",
                        "123 Street", "Room 1", 1L));

        assertEquals("User account not found.", exception.getMessage());
    }

    // ❌ TEST 3: Throws exception when property not found
    @Test
    void registerResident_ShouldThrow_WhenPropertyNotFound() {
        MyUsers user = new MyUsers();
        user.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(propertyRepository.findById(99L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> residentService.registerResident(
                        1L, "John Doe", "john@email.com",
                        "0971234567", "123456/78/9", "Male",
                        "123 Street", "Room 1", 99L));

        assertEquals("Property not found.", exception.getMessage());
    }

    // ✅ TEST 4: Returns all residents
    @Test
    void getAllResidents_ShouldReturnAllResidents() {
        Residents r1 = new Residents();
        Residents r2 = new Residents();

        when(residentRepository.findAll()).thenReturn(List.of(r1, r2));

        List<Residents> result = residentService.getAllResidents();

        assertEquals(2, result.size());
        verify(residentRepository, times(1)).findAll();
    }

    // ✅ TEST 5: Phone number formatting — local number gets +260 prefix
    @Test
    void registerResident_ShouldFormatPhoneCorrectly() {
        MyUsers user = new MyUsers();
        user.setId(1L);

        Property property = new Property();
        property.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(residentRepository.save(any(Residents.class))).thenAnswer(inv -> inv.getArgument(0));

        Residents result = residentService.registerResident(
                1L, "John Doe", "john@email.com",
                "0971234567", "123456789", "Male",
                "123 Street", "Room 1", 1L);

        // Phone should be formatted with +260 prefix
        assertEquals("+2600971234567", result.getPhone());
    }

    // ✅ TEST 6: Name formatting — should be Title Case
    @Test
    void registerResident_ShouldFormatNameToTitleCase() {
        MyUsers user = new MyUsers();
        user.setId(1L);

        Property property = new Property();
        property.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(residentRepository.save(any(Residents.class))).thenAnswer(inv -> inv.getArgument(0));

        Residents result = residentService.registerResident(
                1L, "john doe", "john@email.com",
                "0971234567", "123456789", "Male",
                "123 Street", "Room 1", 1L);

        assertEquals("John Doe", result.getName());
    }
}
