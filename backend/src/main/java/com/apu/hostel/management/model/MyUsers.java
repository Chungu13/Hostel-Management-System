package com.apu.hostel.management.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "my_users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MyUsers implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String myRole;

    /** True once the admin has completed property onboarding */
    @Column(nullable = false)
    private boolean isOnboarded = false;

    /** Cached property ID after admin onboarding — avoids a join on every login */
    @Column
    private Long propertyId;

    /** Approval status set by admin */
    @Column(nullable = false)
    private boolean isApproved = false;

    // Profile fields (primarily for Managing Staff)
    @Column
    private String fullName;

    @Column
    private String phone;

    @Column
    private String address;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String profileImage;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false, updatable = false)
    private Date createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }
}
