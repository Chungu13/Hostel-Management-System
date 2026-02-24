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

    List<VisitRequest> findByVisitorUsername(String visitorUsername);

    List<VisitRequest> findByResidentId(Long residentId);

    @Query("SELECT v FROM VisitRequest v WHERE v.residentName = :residentName AND v.visitorUsername = :visitorUsername")
    Optional<VisitRequest> findByResidentNameAndVisitorUsername(@Param("residentName") String residentName,
            @Param("visitorUsername") String visitorUsername);

    long countByStatus(String status);
}
