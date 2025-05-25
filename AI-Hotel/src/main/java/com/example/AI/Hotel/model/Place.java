package com.example.AI.Hotel.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.Point;

import java.util.List;
import java.util.Map;

@Entity
@Table(name = "places")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Place {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "title", columnDefinition = "TEXT")
    private String title;

    @Column(name = "rating")
    private Float rating;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "review")
    private Integer review;

    @Column(name = "slug", unique = true, columnDefinition = "TEXT")
    private String slug;

    @Column(name = "coordinates", columnDefinition = "geography(POINT, 4326)")
    private Point coordinates;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "service", columnDefinition = "jsonb")
    private List<Map<String, List<String>>> services; // Danh sách các Map với value là danh sách chuỗi

    @OneToMany(mappedBy = "place", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<PlaceEmbedding> embeddings;
}
