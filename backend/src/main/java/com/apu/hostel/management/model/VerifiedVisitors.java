package com.apu.hostel.management.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;

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

    @Column(name = "visit_code", nullable = false)
    private String visitCode;

    @Column(name = "verification_status", nullable = false)
    private String status;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @PrePersist
    protected void onCreate() {
        if (verifiedAt == null) {
            verifiedAt = LocalDateTime.now();
        }
    }

    public VerifiedVisitors(SecurityStaff securityStaff, String residentName, String visitCode) {
        this.securityStaff = securityStaff;
        this.residentName = residentName;
        this.visitCode = visitCode;
        this.status = "Verified";
        this.verifiedAt = LocalDateTime.now();
    }
}
