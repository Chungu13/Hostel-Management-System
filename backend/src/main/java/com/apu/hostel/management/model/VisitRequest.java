package com.apu.hostel.management.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "visit_requests", indexes = {
        @Index(name = "idx_visit_resident", columnList = "resident_id"),
        @Index(name = "idx_visit_status", columnList = "status"),
        @Index(name = "idx_visit_code", columnList = "visit_code")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VisitRequest implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "resident_id", referencedColumnName = "id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"myUser", "property", "hibernateLazyInitializer", "handler"})
    private Residents resident;

    @Column(name = "resident_name", nullable = false)
    private String residentName;

    @Column(name = "visitor_name", nullable = false)
    private String visitorName;

    @Column(name = "visit_code", nullable = false, unique = true)
    private String visitCode;

    @Column(name = "request_date", nullable = false)
    private LocalDateTime requestDate;

    @Column(name = "visit_date")
    private String visitDate;

    @Column(name = "visit_time")
    private String visitTime;

    @Column(name = "purpose")
    private String purpose;

    @Column(name = "status", nullable = false)
    private String status;

    @PrePersist
    protected void onCreate() {
        requestDate = LocalDateTime.now();
        if (status == null) {
            status = "Approved";
        }
    }

    public VisitRequest(Residents resident, String residentName, String visitorName, String visitCode,
            String visitDate, String visitTime, String purpose) {
        this.resident = resident;
        this.residentName = residentName;
        this.visitorName = visitorName;
        this.visitCode = visitCode;
        this.visitDate = visitDate;
        this.visitTime = visitTime;
        this.purpose = purpose;
        this.requestDate = LocalDateTime.now();
        this.status = "Approved";
    }
}
