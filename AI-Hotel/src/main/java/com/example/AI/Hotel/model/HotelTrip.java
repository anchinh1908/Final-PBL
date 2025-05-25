package com.example.AI.Hotel.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "hotel_trip")
@Data
public class HotelTrip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "hotel_id", nullable = false)
    private Integer hotelId;

    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

//     Quan hệ với Hotel
    @ManyToOne
    @JoinColumn(name = "hotel_id", insertable = false, updatable = false)
    private Hotel hotel;
}
