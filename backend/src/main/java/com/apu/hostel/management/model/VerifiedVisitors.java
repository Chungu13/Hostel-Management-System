package com.apu.hostel.management.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Entity
@Table(name = "verified_visitors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifiedVisitors implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "securitystaff_id", referencedColumnName = "id", nullable = false)
    private SecurityStaff securityStaff;

    @Column(name = "resident_name", nullable = false)
    private String residentName;

    @Column(name = "visitor_username", nullable = false)
    private String visitorUsername;

    @Column(name = "visitor_password", nullable = false)
    private String visitorPassword;

    @Column(name = "verification_status", nullable = false)
    private String status;

    public VerifiedVisitors(SecurityStaff securityStaff, String residentName, String visitorUsername,
            String visitorPassword) {
        this.securityStaff = securityStaff;
        this.residentName = residentName;
        this.visitorUsername = visitorUsername;
        this.visitorPassword = visitorPassword;
        this.status = "Verified";
    }
}
