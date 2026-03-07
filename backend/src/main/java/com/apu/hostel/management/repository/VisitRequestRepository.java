package com.apu.hostel.management.repository;

import com.apu.hostel.management.model.VisitRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VisitRequestRepository extends JpaRepository<VisitRequest, Long> {

    List<VisitRequest> findByVisitorName(String visitorName);

    Optional<VisitRequest> findByVisitCode(String visitCode);

    List<VisitRequest> findByResidentId(Long residentId);

    Page<VisitRequest> findByResidentId(Long residentId, Pageable pageable);

    @Query("SELECT v FROM VisitRequest v WHERE v.resident.id = :residentId AND v.requestDate > :after")
    Page<VisitRequest> findByResidentIdAndAfter(@Param("residentId") Long residentId,
            @Param("after") LocalDateTime after, Pageable pageable);

    @Query("SELECT v FROM VisitRequest v WHERE v.residentName = :residentName AND v.visitCode = :visitCode")
    Optional<VisitRequest> findByResidentNameAndVisitCode(@Param("residentName") String residentName,
            @Param("visitCode") String visitCode);

    long countByStatus(String status);

    long countByResidentPropertyIdAndVisitDate(Long propertyId, String visitDate);

    @Query("SELECT v.status, COUNT(v) FROM VisitRequest v WHERE v.resident.property.id = :propertyId GROUP BY v.status")
    List<Object[]> countByStatusAndPropertyId(@Param("propertyId") Long propertyId);

    @Query("SELECT v.visitDate, COUNT(v) FROM VisitRequest v WHERE v.resident.property.id = :propertyId AND v.visitDate LIKE :monthPrefix% GROUP BY v.visitDate")
    List<Object[]> countByDayInMonth(@Param("propertyId") Long propertyId, @Param("monthPrefix") String monthPrefix);

    @Query("SELECT v.resident.name, COUNT(v) FROM VisitRequest v WHERE v.resident.property.id = :propertyId GROUP BY v.resident.name ORDER BY COUNT(v) DESC")
    List<Object[]> findTopResidentsByVisitors(@Param("propertyId") Long propertyId);

    @Query("SELECT v.visitDate, COUNT(v) FROM VisitRequest v WHERE v.resident.property.id = :propertyId GROUP BY v.visitDate")
    List<Object[]> countByDateAndPropertyId(@Param("propertyId") Long propertyId);
}
