package com.apu.hostel.management.controller.admin;

import com.apu.hostel.management.model.MyUsers;
import com.apu.hostel.management.repository.UserRepository;
import com.apu.hostel.management.service.ReportingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportingService reportingService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.apu.hostel.management.security.SecurityUtils securityUtils;

    private Long getAdminPropertyId() {
        Long userId = securityUtils.getUserId();
        if (userId != null) {
            return userRepository.findById(userId)
                    .map(MyUsers::getPropertyId)
                    .orElse(null);
        }
        return null;
    }

    @GetMapping("/residents")
    public Map<String, Object> residentReports() {
        Long propertyId = getAdminPropertyId();
        return Map.of(
                "genderReport", reportingService.getResidentGenderReport(propertyId),
                "approvalReport", reportingService.getResidentApprovalReport(propertyId),
                "totalResidents", reportingService.getTotalResidents(propertyId));
    }

    @GetMapping("/security")
    public Map<String, Object> securityReports() {
        Long propertyId = getAdminPropertyId();
        return Map.of(
                "genderReport", reportingService.getSecurityGenderReport(propertyId),
                "totalSecurity", reportingService.getTotalSecurityStaff(propertyId));
    }

    @GetMapping("/analytics")
    public Map<String, Object> getAnalytics() {
        Long propertyId = getAdminPropertyId();
        String monthPrefix = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM"));

        List<Object[]> statusData = reportingService.getVisitStatusBreakdown(propertyId);
        List<Object[]> dailyData = reportingService.getVisitsPerDayInMonth(propertyId, monthPrefix);
        List<Object[]> topResidentsData = reportingService.getTopResidentsByVisitors(propertyId);
        List<Object[]> allVisitsByDay = reportingService.getVisitsByDay(propertyId);

        // Process status for Approval Rate
        long approved = 0, rejected = 0;
        for (Object[] row : statusData) {
            String status = row[0].toString();
            long count = ((Number) row[1]).longValue();
            if ("Approved".equalsIgnoreCase(status))
                approved = count;
            else if ("Rejected".equalsIgnoreCase(status))
                rejected = count;
        }

        double approvalRate = (approved + rejected) > 0 ? (double) approved / (approved + rejected) * 100 : 0;

        // Process monthly visits
        long totalVisitsThisMonth = 0;
        for (Object[] row : dailyData) {
            totalVisitsThisMonth += ((Number) row[1]).longValue();
        }

        int daysInMonthSoFar = java.time.LocalDate.now().getDayOfMonth();
        double avgVisitsPerDay = (double) totalVisitsThisMonth / daysInMonthSoFar;

        // Busiest day of week (1-7)
        Map<String, Long> dayOfWeekCount = new java.util.HashMap<>();
        String[] dayNames = { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" };
        for (String day : dayNames)
            dayOfWeekCount.put(day, 0L);

        for (Object[] row : allVisitsByDay) {
            try {
                java.time.LocalDate date = java.time.LocalDate.parse(row[0].toString());
                String dayName = date.getDayOfWeek().getDisplayName(java.time.format.TextStyle.FULL,
                        java.util.Locale.ENGLISH);
                dayOfWeekCount.put(dayName, dayOfWeekCount.getOrDefault(dayName, 0L) + ((Number) row[1]).longValue());
            } catch (Exception e) {
            }
        }

        String busiestDay = "N/A";
        long maxCount = -1;
        for (Map.Entry<String, Long> entry : dayOfWeekCount.entrySet()) {
            if (entry.getValue() > maxCount) {
                maxCount = entry.getValue();
                busiestDay = entry.getKey();
            }
        }

        return Map.of(
                "metrics", Map.of(
                        "totalVisitsMonth", totalVisitsThisMonth,
                        "approvalRate", Math.round(approvalRate * 10) / 10.0,
                        "avgVisitsPerDay", Math.round(avgVisitsPerDay * 10) / 10.0,
                        "busiestDay", busiestDay),
                "charts", Map.of(
                        "visitsPerDay", dailyData,
                        "statusBreakdown", statusData,
                        "busiestDaysOfWeek", dayOfWeekCount.entrySet().stream()
                                .map(e -> Map.of("day", e.getKey(), "count", e.getValue()))
                                .sorted((a, b) -> {
                                    List<String> order = java.util.Arrays.asList(dayNames);
                                    return order.indexOf(a.get("day")) - order.indexOf(b.get("day"));
                                }).toList(),
                        "topResidents", topResidentsData.stream().limit(5).toList()));
    }
}
