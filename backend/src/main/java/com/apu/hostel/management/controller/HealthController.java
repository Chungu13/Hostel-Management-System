package com.apu.hostel.management.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import java.util.TreeMap;

@RestController
public class HealthController {

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        Map<String, Object> status = new TreeMap<>();
        status.put("status", "UP");
        status.put("timestamp", java.time.LocalDateTime.now().toString());
        status.put("version", "1.0.0");
        status.put("system", "APU Hostel Management System");
        return status;
    }
}
