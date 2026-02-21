package com.apu.hostel.management.repository;

import com.apu.hostel.management.model.MyUsers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<MyUsers, Long> {

    Optional<MyUsers> findByUserName(String userName);

    Optional<MyUsers> findByEmail(String email);

    @Query("SELECT u FROM MyUsers u WHERE u.myRole = :myRole AND u.userName NOT IN (SELECT s.username FROM SecurityStaff s)")
    List<MyUsers> findAvailableSecurityStaff(@Param("myRole") String myRole);

    @Query("SELECT u FROM MyUsers u WHERE u.myRole = :myRole AND u.userName NOT IN (SELECT r.username FROM Residents r)")
    List<MyUsers> findAvailableResidents(@Param("myRole") String myRole);

    @Query("SELECT u FROM MyUsers u WHERE u.myRole = :myRole ORDER BY u.createdAt DESC")
    List<MyUsers> findLatestUsersByRole(@Param("myRole") String myRole);

    Optional<MyUsers> findByEmailAndPassword(String email, String password);

    Optional<MyUsers> findByUserNameAndPassword(String username, String password);

    @Query("SELECT u FROM MyUsers u WHERE u.userName = :username AND u.password = :password AND EXISTS (SELECT r FROM Residents r WHERE r.username = u.userName AND r.approved = TRUE)")
    Optional<MyUsers> validateResidentLogin(@Param("username") String username, @Param("password") String password);
}
