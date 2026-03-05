package com.apu.hostel.management.repository;

import com.apu.hostel.management.model.Residents;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResidentRepository extends JpaRepository<Residents, Long> {

    List<Residents> findByPropertyId(Long propertyId);

    long countByPropertyId(Long propertyId);

    List<Residents> findByNameContaining(String name);

    Optional<Residents> findByEmail(String email);

    Optional<Residents> findByIc(String ic);

    Optional<Residents> findByPhone(String phone);

    boolean existsByIc(String ic);

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);

    List<Residents> findByApproved(boolean approved);

    @Query("SELECT r.gender, COUNT(r) FROM Residents r WHERE r.property.id = :propertyId GROUP BY r.gender")
    List<Object[]> countByGenderAndPropertyId(Long propertyId);

    @Query("SELECT r.approved, COUNT(r) FROM Residents r WHERE r.property.id = :propertyId GROUP BY r.approved")
    List<Object[]> countByApprovalStatusAndPropertyId(Long propertyId);
}
