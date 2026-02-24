package com.apu.hostel.management.repository;

import com.apu.hostel.management.model.SecurityStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SecurityStaffRepository extends JpaRepository<SecurityStaff, Long> {

    List<SecurityStaff> findByNameContaining(String name);

    Optional<SecurityStaff> findByEmail(String email);

    Optional<SecurityStaff> findByIc(String ic);

    long count();

    @Query("SELECT s.gender, COUNT(s) FROM SecurityStaff s GROUP BY s.gender")
    List<Object[]> countByGender();
}
