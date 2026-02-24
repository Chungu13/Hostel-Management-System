package com.apu.hostel.management.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Entity
@Table(name = "security_staff")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SecurityStaff implements Serializable {

    @Id
    private Long id;

    @OneToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name = "id")
    @MapsId
    private MyUsers myUser;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String phone;

    @Column(nullable = false, unique = true)
    private String ic;

    @Column(nullable = false)
    private String gender;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private boolean approved;

    @ManyToOne
    @JoinColumn(name = "property_id")
    private Property property;

    public SecurityStaff(MyUsers myUser, String name, String email, String phone, String ic, String gender,
            String address, Property property) {
        this.myUser = myUser;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.ic = ic;
        this.gender = gender;
        this.address = address;
        this.approved = true;
        this.property = property;
    }
}
