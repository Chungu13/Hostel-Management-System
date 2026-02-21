package com.apu.hostel.management.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Entity
@Table(name = "visitor_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VisitorDetails implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "visit_request_id", nullable = false)
    private VisitRequest visitRequest;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String ic;

    @Column(nullable = false)
    private String visitorName;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String gender;

    @Column(nullable = false)
    private String address;

    public VisitorDetails(VisitRequest visitRequest, String visitorName, String email, String phone, String ic,
            String gender, String address) {
        this.visitRequest = visitRequest;
        this.visitorName = visitorName;
        this.email = email;
        this.phone = phone;
        this.ic = ic;
        this.gender = gender;
        this.address = address;
    }
}
