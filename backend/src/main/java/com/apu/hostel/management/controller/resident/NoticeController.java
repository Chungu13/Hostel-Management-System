package com.apu.hostel.management.controller.resident;

import com.apu.hostel.management.model.Notice;
import com.apu.hostel.management.repository.NoticeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notices")
public class NoticeController {

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private com.apu.hostel.management.repository.UserRepository userRepository;

    @Autowired
    private com.apu.hostel.management.security.SecurityUtils securityUtils;

    private Long getResidentPropertyId() {
        Long userId = securityUtils.getUserId();
        if (userId == null) {
            throw new IllegalStateException("Authentication context missing or invalid.");
        }
        return userRepository.findById(userId)
                .map(com.apu.hostel.management.model.MyUsers::getPropertyId)
                .orElseThrow(() -> new IllegalStateException("Resident profile not found"));
    }

    @GetMapping("/latest")
    public ResponseEntity<Notice> getLatestNotice() {
        return noticeRepository.findLatestNoticeByProperty(getResidentPropertyId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}
