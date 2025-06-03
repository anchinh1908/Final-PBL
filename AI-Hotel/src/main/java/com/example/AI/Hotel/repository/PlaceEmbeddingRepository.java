package com.example.AI.Hotel.repository;

import com.example.AI.Hotel.model.PlaceEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PlaceEmbeddingRepository extends JpaRepository<PlaceEmbedding, Integer> {

//    boolean existsByPlaceId(Integer placeId);

    long count();

    @Query("SELECT pe FROM PlaceEmbedding pe JOIN FETCH pe.place")
    List<PlaceEmbedding> findAllWithPlaceId();

    @Query(value = "SELECT * FROM place_embeddings ORDER BY text_embedding <-> CAST(:embedding AS vector) LIMIT :limit", nativeQuery = true)
    List<PlaceEmbedding> findNearestPlaces(@Param("embedding") String embedding, @Param("limit") int limit);
}
