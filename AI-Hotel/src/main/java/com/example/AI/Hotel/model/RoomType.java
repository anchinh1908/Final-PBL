package com.example.AI.Hotel.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "room_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @Column(name = "name", columnDefinition = "TEXT")
    private String name;

    @Column(name = "number_of_guests")
    private Integer numberOfGuests;

    @Column(name = "price")
    private Integer price;

    @Column(name = "original_price")
    private Integer originalPrice;

    @Column(name = "taxes_and_fees_under_price")
    private Boolean taxesAndFeesUnderPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "VARCHAR(50) DEFAULT 'AVAILABLE'")
    private Status status;

    public enum Status {
        AVAILABLE, BOOKED, CHECKED_IN, CHECKED_OUT
    }
}
