package com.apu.hostel.management.repository;

import com.apu.hostel.management.model.Residents;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResidentRepository extends JpaRepository<Residents, Long> {

    List<Residents> findByNameContaining(String name);

    Optional<Residents> findByEmail(String email);

    Optional<Residents> findByIc(String ic);

    List<Residents> findByApproved(boolean approved);

    @Query("SELECT r.gender, COUNT(r) FROM Residents r GROUP BY r.gender")
    List<Object[]> countByGender();

    @Query("SELECT r.approved, COUNT(r) FROM Residents r GROUP BY r.approved")
    List<Object[]> countByApprovalStatus();
}
