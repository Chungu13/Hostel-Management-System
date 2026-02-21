package com.apu.hostel.management.repository;

import com.apu.hostel.management.model.VerifiedVisitors;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VerifiedVisitorsRepository extends JpaRepository<VerifiedVisitors, Long> {
    List<VerifiedVisitors> findBySecurityStaffUsername(String username);

    List<VerifiedVisitors> findByOrderByIdDesc();
}
