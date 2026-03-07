package com.apu.hostel.management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VisitRequestDTO {

    @NotNull(message = "Resident ID is required")
    private Long residentId;

    @NotBlank(message = "Resident name is required")
    private String residentName;

    @NotBlank(message = "Visitor name is required")
    private String visitorName;

    @NotBlank(message = "Visit date is required")
    private String visitDate;

    @NotBlank(message = "Visit time is required")
    private String visitTime;

    @NotBlank(message = "Purpose of visit is required")
    private String purpose;
}
