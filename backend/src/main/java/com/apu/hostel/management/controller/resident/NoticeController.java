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

    private Long getResidentPropertyId() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof com.apu.hostel.management.security.JwtPrincipal principal) {
            return userRepository.findById(principal.getUserId())
                    .map(com.apu.hostel.management.model.MyUsers::getPropertyId)
                    .orElseThrow(() -> new IllegalStateException("Resident profile not found"));
        }
        throw new IllegalStateException("Authentication context missing or invalid.");
    }

    @GetMapping("/latest")
    public ResponseEntity<Notice> getLatestNotice() {
        return noticeRepository.findLatestNoticeByProperty(getResidentPropertyId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}
