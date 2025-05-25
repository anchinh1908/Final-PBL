package com.example.AI.Hotel.model;

//import com.fasterxml.jackson.annotation.JsonIgnore;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.Point;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "hotels")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name", columnDefinition = "TEXT")
    private String name;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "district", columnDefinition = "TEXT")
    private String district;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "hotel_link", columnDefinition = "TEXT")
    private String hotelLink;

    @Column(name = "rating_stars", nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer ratingStars;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "facilities", columnDefinition = "jsonb")
    private List<String> facilities; // Danh sách các chuỗi

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "highlights", columnDefinition = "jsonb")
    private Map<String, List<String>> highlights; // Map với value là danh sách chuỗi

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "reviews", columnDefinition = "jsonb")
    private Map<String, Double> reviews; // Map với value là số

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "image_urls", columnDefinition = "jsonb")
    private List<String> imageUrls; // Danh sách các chuỗi

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "room_services", columnDefinition = "jsonb")
    private Map<String, List<String>> roomServices; // Map với value là danh sách chuỗi

    @Column(name = "slug", unique = true, columnDefinition = "TEXT")
    private String slug;

    @Column(name = "coordinates", columnDefinition = "geography(POINT, 4326)")
    private Point coordinates;

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RoomType> rooms;

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
//    @JsonIgnore
    private List<HotelEmbedding> embeddings;

}
