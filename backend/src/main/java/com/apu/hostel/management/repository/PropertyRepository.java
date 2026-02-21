package com.apu.hostel.management.repository;

import com.apu.hostel.management.model.MyUsers;
import com.apu.hostel.management.model.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    Optional<Property> findByAdmin(MyUsers admin);
}
