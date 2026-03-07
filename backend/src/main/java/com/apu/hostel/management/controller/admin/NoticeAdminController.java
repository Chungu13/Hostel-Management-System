package com.apu.hostel.management.controller.admin;

import com.apu.hostel.management.model.Notice;
import com.apu.hostel.management.repository.NoticeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/notices")
public class NoticeAdminController {

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private com.apu.hostel.management.repository.UserRepository userRepository;

    @Autowired
    private com.apu.hostel.management.security.SecurityUtils securityUtils;

    private Long getAdminPropertyId() {
        Long userId = securityUtils.getUserId();
        if (userId != null) {
            return userRepository.findById(userId)
                    .map(com.apu.hostel.management.model.MyUsers::getPropertyId)
                    .orElse(null);
        }
        return null;
    }

    @PostMapping("/publish")
    public ResponseEntity<?> publishNotice(@RequestBody Map<String, String> data) {
        String content = data.get("content");
        String title = data.get("title");
        String importance = data.get("importance");

        Notice notice = new Notice();
        notice.setContent(content);
        notice.setTitle(title);
        notice.setImportance(importance != null ? importance : "Low");
        notice.setPropertyId(getAdminPropertyId());

        Notice saved = noticeRepository.save(notice);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/latest")
    public ResponseEntity<Notice> getLatestNotice() {
        return noticeRepository.findLatestNoticeByProperty(getAdminPropertyId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllNotices() {
        return ResponseEntity.ok(noticeRepository.findByPropertyIdOrderByUpdatedAtDesc(getAdminPropertyId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotice(@PathVariable Long id) {
        Notice notice = noticeRepository.findById(id).orElse(null);
        if (notice == null) {
            return ResponseEntity.notFound().build();
        }

        // Security check: ensure admin owns this notice
        if (!notice.getPropertyId().equals(getAdminPropertyId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden: Not your property"));
        }

        noticeRepository.delete(notice);
        return ResponseEntity.ok(Map.of("message", "Notice deleted"));
    }
}
