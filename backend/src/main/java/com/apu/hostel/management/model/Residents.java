package com.apu.hostel.management.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Entity
@Table(name = "residents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Residents implements Serializable {

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

    @Column(nullable = true)
    private String address;

    @Column(nullable = false)
    private String room;

    @Column(nullable = false)
    private boolean approved;

    @ManyToOne
    @JoinColumn(name = "property_id")
    private Property property;

    public Residents(MyUsers myUser, String name, String email, String phone, String ic, String gender, String address,
            String room, Property property) {
        this.myUser = myUser;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.ic = ic;
        this.gender = gender;
        this.address = address;
        this.room = room;
        this.approved = false;
        this.property = property;
    }
}
