package com.apu.hostel.management.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "visit_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VisitRequest implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "resident_username", referencedColumnName = "username", nullable = false)
    private Residents resident;

    @Column(name = "resident_name", nullable = false)
    private String residentName;

    @Column(name = "visitor_name", nullable = false)
    private String visitorName;

    @Column(name = "visitor_username", nullable = false, unique = true)
    private String visitorUsername;

    @Column(name = "visitor_password", nullable = false)
    private String visitorPassword;

    @Column(name = "request_date", nullable = false)
    private LocalDateTime requestDate;

    @Column(name = "status", nullable = false)
    private String status;

    @PrePersist
    protected void onCreate() {
        requestDate = LocalDateTime.now();
        if (status == null) {
            status = "Pending";
        }
    }

    public VisitRequest(Residents resident, String residentName, String visitorName, String visitorUsername,
            String visitorPassword) {
        this.resident = resident;
        this.residentName = residentName;
        this.visitorName = visitorName;
        this.visitorUsername = visitorUsername;
        this.visitorPassword = visitorPassword;
        this.requestDate = LocalDateTime.now();
        this.status = "Pending";
    }
}
