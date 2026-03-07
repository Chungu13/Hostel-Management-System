package com.apu.hostel.management.repository;

import com.apu.hostel.management.model.SecurityStaff;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SecurityStaffRepository extends JpaRepository<SecurityStaff, Long> {

    List<SecurityStaff> findByPropertyId(Long propertyId);

    Page<SecurityStaff> findByPropertyId(Long propertyId, Pageable pageable);

    List<SecurityStaff> findByPropertyIdAndOnDuty(Long propertyId, boolean onDuty);

    long countByPropertyId(Long propertyId);

    List<SecurityStaff> findByNameContaining(String name);

    Page<SecurityStaff> findByNameContainingIgnoreCaseAndPropertyId(String name, Long propertyId, Pageable pageable);

    Optional<SecurityStaff> findByEmail(String email);

    Optional<SecurityStaff> findByIc(String ic);

    Optional<SecurityStaff> findByPhone(String phone);

    boolean existsByIc(String ic);

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);

    @Query("SELECT s.gender, COUNT(s) FROM SecurityStaff s WHERE s.property.id = :propertyId GROUP BY s.gender")
    List<Object[]> countByGenderAndPropertyId(Long propertyId);
}
