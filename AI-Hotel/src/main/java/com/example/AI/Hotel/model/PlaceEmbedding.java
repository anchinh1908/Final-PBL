package com.example.AI.Hotel.model;
import com.example.AI.Hotel.converter.StringVectorConverter;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Array;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;

import jakarta.persistence.*;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "place_embeddings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaceEmbedding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id", nullable = false)
    private Place place;

//    @Convert(converter = StringVectorConverter.class)
    @Column(name = "embedding", columnDefinition = "vector(3072)")
    private String embedding;


}

