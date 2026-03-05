package com.apu.hostel.management.repository;

import com.apu.hostel.management.model.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    @Query("SELECT n FROM Notice n WHERE n.propertyId = :propertyId ORDER BY n.updatedAt DESC LIMIT 1")
    Optional<Notice> findLatestNoticeByProperty(Long propertyId);

    java.util.List<Notice> findByPropertyIdOrderByUpdatedAtDesc(Long propertyId);
}
