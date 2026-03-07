package com.apu.hostel.management.controller.resident;

import com.apu.hostel.management.controller.GlobalExceptionHandler;
import com.apu.hostel.management.dto.VisitRequestDTO;
import com.apu.hostel.management.model.VisitRequest;
import com.apu.hostel.management.repository.UserRepository;
import com.apu.hostel.management.repository.VisitRequestRepository;
import com.apu.hostel.management.service.VisitService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.data.domain.PageImpl;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(VisitController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class VisitControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockBean
        private VisitService visitService;

        @MockBean
        private VisitRequestRepository visitRequestRepository;

        @MockBean
        private UserRepository userRepository;

        @MockBean
        private com.apu.hostel.management.security.JwtUtil jwtUtil;

        @MockBean
        private com.apu.hostel.management.security.JwtAuthFilter jwtAuthFilter;

        @MockBean
        private com.apu.hostel.management.security.SecurityUtils securityUtils;

        @Test
        void getAdminHistory_ShouldReturn200() throws Exception {
                when(securityUtils.isManagingStaff()).thenReturn(true);
                when(visitService.getAllHistoryAdmin(any())).thenReturn(new PageImpl<>(List.of()));

                mockMvc.perform(get("/api/visits/admin/history"))
                                .andExpect(status().isOk());
        }

        @Test
        void getResidentVisits_ShouldReturn200() throws Exception {
                when(securityUtils.getUserId()).thenReturn(1L);
                when(userRepository.findById(anyLong()))
                                .thenReturn(Optional.of(new com.apu.hostel.management.model.MyUsers()));
                when(visitService.getRequestsByResident(anyLong(), any(), any()))
                                .thenReturn(new PageImpl<>(List.of()));

                mockMvc.perform(get("/api/visits/resident/1"))
                                .andExpect(status().isOk());
        }

        @Test
        void requestVisit_ShouldReturn200_WhenValidInput() throws Exception {
                VisitRequest created = new VisitRequest();
                created.setId(1L);
                created.setVisitCode("ABC12345");
                created.setStatus("Approved");

                when(visitService.createVisitRequest(anyLong(), anyString(), anyString(), anyString(), anyString(),
                                anyString()))
                                .thenReturn(created);

                VisitRequestDTO dto = new VisitRequestDTO();
                dto.setResidentId(1L);
                dto.setResidentName("Jane Resident");
                dto.setVisitorName("John Doe");
                dto.setVisitDate("2025-01-01");
                dto.setVisitTime("10:00");
                dto.setPurpose("Friendly visit");

                mockMvc.perform(post("/api/visits/request")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto)))
                                .andExpect(status().isOk());
        }

        @Test
        void requestVisit_ShouldReturn400_WhenVisitorNameBlank() throws Exception {
                VisitRequestDTO dto = new VisitRequestDTO();
                dto.setResidentId(1L);
                dto.setResidentName("Jane Resident");
                dto.setVisitorName("");
                dto.setVisitDate("2025-01-01");
                dto.setVisitTime("10:00");
                dto.setPurpose("Purpose");

                mockMvc.perform(post("/api/visits/request")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto)))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void requestVisit_ShouldReturn400_WhenResidentIdMissing() throws Exception {
                VisitRequestDTO dto = new VisitRequestDTO();
                dto.setResidentId(null);
                dto.setResidentName("Jane Resident");
                dto.setVisitorName("John Doe");
                dto.setVisitDate("2025-01-01");
                dto.setVisitTime("10:00");
                dto.setPurpose("Purpose");

                mockMvc.perform(post("/api/visits/request")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto)))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void updateVisitStatus_ShouldReturn200() throws Exception {
                doNothing().when(visitService).updateStatus(anyLong(), anyString());

                mockMvc.perform(post("/api/visits/status")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"id\": 1, \"status\": \"Completed\"}"))
                                .andExpect(status().isOk());
        }

        @Test
        void deleteVisit_ShouldReturn200() throws Exception {
                doNothing().when(visitService).deleteVisit(anyLong());

                mockMvc.perform(delete("/api/visits/1"))
                                .andExpect(status().isOk());
        }

        @Test
        void getPublicVisitPass_ShouldReturn200_WhenCodeExists() throws Exception {
                VisitRequest visit = new VisitRequest();
                visit.setVisitCode("ABC12345");

                when(visitRequestRepository.findByVisitCode("ABC12345"))
                                .thenReturn(Optional.of(visit));

                mockMvc.perform(get("/api/visits/public/pass/ABC12345"))
                                .andExpect(status().isOk());
        }

        @Test
        void getPublicVisitPass_ShouldReturn404_WhenCodeNotFound() throws Exception {
                when(visitRequestRepository.findByVisitCode(anyString()))
                                .thenReturn(Optional.empty());

                mockMvc.perform(get("/api/visits/public/pass/INVALID"))
                                .andExpect(status().isNotFound());
        }
}