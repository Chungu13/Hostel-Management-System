package com.apu.hostel.management.repository;

import com.apu.hostel.management.model.VisitorDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VisitorDetailsRepository extends JpaRepository<VisitorDetails, Long> {
    Optional<VisitorDetails> findByEmail(String email);

    Optional<VisitorDetails> findByIc(String ic);

    Optional<VisitorDetails> findByVisitRequestId(Long visitRequestId);
}
