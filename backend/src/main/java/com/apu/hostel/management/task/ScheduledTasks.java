package com.apu.hostel.management.task;

import com.apu.hostel.management.model.VisitRequest;
import com.apu.hostel.management.repository.VisitRequestRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Slf4j
public class ScheduledTasks {

    @Autowired
    private VisitRequestRepository visitRequestRepository;

    /**
     * Runs every day at 1:00 AM (Cron: 0 0 1 * * *)
     * Marks 'Approved' visit requests as 'Expired' if they are older than 48 hours.
     */
    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void expireOldVisitRequests() {
        log.info("Starting scheduled task: Expiring old visit requests");

        LocalDateTime cutoff = LocalDateTime.now().minusHours(48);
        List<VisitRequest> allRequests = visitRequestRepository.findAll();

        long count = 0;
        for (VisitRequest request : allRequests) {
            if ("Approved".equals(request.getStatus()) && request.getRequestDate().isBefore(cutoff)) {
                request.setStatus("Expired");
                visitRequestRepository.save(request);
                count++;
            }
        }

        log.info("Scheduled task finished: Marked {} visit requests as Expired", count);
    }

    /**
     * Runs every week on Sunday at 2:00 AM
     * Placeholder for more aggressive cleanup if needed.
     */
    @Scheduled(cron = "0 0 2 * * SUN")
    public void weeklySystemMaintenance() {
        log.info("Starting weekly system maintenance...");
        // Add database optimization or log rotation logic here if required
        log.info("Weekly system maintenance complete.");
    }
}
