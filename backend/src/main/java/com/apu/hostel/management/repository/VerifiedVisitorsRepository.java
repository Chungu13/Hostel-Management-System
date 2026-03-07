package com.apu.hostel.management.repository;

import com.apu.hostel.management.model.VerifiedVisitors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VerifiedVisitorsRepository extends JpaRepository<VerifiedVisitors, Long> {
    List<VerifiedVisitors> findBySecurityStaffId(Long staffId);

    List<VerifiedVisitors> findByOrderByIdDesc();

    Page<VerifiedVisitors> findBySecurityStaffPropertyId(Long propertyId, Pageable pageable);

    long countByVerifiedAtAfter(LocalDateTime startOfDay);

    long countBySecurityStaffPropertyIdAndVerifiedAtAfter(Long propertyId, LocalDateTime startOfDay);

    List<VerifiedVisitors> findFirst5ByOrderByIdDesc();

    List<VerifiedVisitors> findFirst5BySecurityStaffPropertyIdOrderByIdDesc(Long propertyId);

    @org.springframework.data.jpa.repository.Query("SELECT v FROM VerifiedVisitors v WHERE v.securityStaff.property.id = :propertyId AND (:after IS NULL OR v.verifiedAt > :after)")
    Page<VerifiedVisitors> findByPropertyIdAndVerifiedAtAfter(Long propertyId, LocalDateTime after, Pageable pageable);
}
