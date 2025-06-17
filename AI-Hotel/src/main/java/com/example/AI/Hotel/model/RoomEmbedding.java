package com.example.AI.Hotel.model;

import com.example.AI.Hotel.converter.StringVectorConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "room_embeddings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomEmbedding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private RoomType room;

//    @Convert(converter = StringVectorConverter.class)
    @Column(name = "embedding", columnDefinition = "vector(3072)")
    private String embedding;
}
