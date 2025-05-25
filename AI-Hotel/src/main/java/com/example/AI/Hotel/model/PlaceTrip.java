package com.example.AI.Hotel.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "place_trip")
@Data
public class PlaceTrip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "place_id", nullable = false)
    private Integer placeId;

    // Quan hệ với User (nếu cần)
//    @ManyToOne
//    @JoinColumn(name = "user_id", insertable = false, updatable = false)
//    private User user;

    // Quan hệ với Place
//     @ManyToOne
//     @JoinColumn(name = "place_id", insertable = false, updatable = false)
//     private Place place;
}
