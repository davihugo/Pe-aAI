package com.pecaai.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "neighborhoods")
public class Neighborhood {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private Double deliveryFee;

    private Double latitude;
    private Double longitude;
}
