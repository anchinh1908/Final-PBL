package com.example.AI.Hotel.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "travel_chunks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TravelChunk {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @Column(name = "text", columnDefinition = "text")
    private String text;

    @Column(name = "metadata", columnDefinition = "jsonb")
    private String metadata;

    @Column(name = "embedding", columnDefinition = "vector(3072)")
    private String embedding;
}
