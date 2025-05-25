package com.example.AI.Hotel.repository;

import com.example.AI.Hotel.model.HotelEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HotelEmbeddingRepository extends JpaRepository<HotelEmbedding, Integer> {
    long count();


    @Query("SELECT he FROM HotelEmbedding he JOIN FETCH he.hotel")
    List<HotelEmbedding> findAllWithHotelId();


    @Query(value = "SELECT he.hotel_id, he.text_embedding <=> CAST(:queryEmbedding AS vector) AS distance " +
            "FROM hotel_embeddings_backup he " +
            "WHERE he.text_embedding <=> CAST(:queryEmbedding AS vector) < :maxDistance " +
            "ORDER BY distance " +
            "LIMIT :limit", nativeQuery = true)
    List<Object[]> findTopSimilarHotels(@Param("queryEmbedding") String queryEmbedding,
                                        @Param("maxDistance") double maxDistance,
                                        @Param("limit") int limit);

    // Phương thức mới để lấy tất cả khách sạn và tính độ tương đồng
    @Query(value = "SELECT he.hotel_id, he.text_embedding <=> :queryEmbedding AS distance " +
            "FROM hotel_embeddings_backup he " +
            "ORDER BY distance", nativeQuery = true)
    List<Object[]> findAllWithDistance(@Param("queryEmbedding") String queryEmbedding);

}