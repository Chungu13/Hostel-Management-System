package com.apu.hostel.management.repository;

import com.apu.hostel.management.model.VisitRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VisitRequestRepository extends JpaRepository<VisitRequest, Long> {

    List<VisitRequest> findByVisitorName(String visitorName);

    Optional<VisitRequest> findByVisitCode(String visitCode);

    List<VisitRequest> findByResidentId(Long residentId);

    @Query("SELECT v FROM VisitRequest v WHERE v.residentName = :residentName AND v.visitCode = :visitCode")
    Optional<VisitRequest> findByResidentNameAndVisitCode(@Param("residentName") String residentName,
            @Param("visitCode") String visitCode);

    long countByStatus(String status);
}
