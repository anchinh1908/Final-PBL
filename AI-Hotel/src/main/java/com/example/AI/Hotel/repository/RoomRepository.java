package com.example.AI.Hotel.repository;

import com.example.AI.Hotel.model.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RoomRepository extends JpaRepository<RoomType, Integer> {
    Page<RoomType> findAll(Pageable pageable); // phân trang

    Page<RoomType> findByNameContainingIgnoreCase(Pageable pageable,String name);

    // Truy vấn lấy danh sách RoomType dựa trên danh sách ID
    List<RoomType> findByIdIn(@Param("roomIds") List<Integer> roomIds);

    //  tìm phòng chỉ theo giá
    @Query("SELECT r FROM RoomType r WHERE r.price <= :maxPrice")
    List<RoomType> findByPrice(@Param("maxPrice") Double maxPrice);

    // tìm phòng chỉ theo số khách
    @Query("SELECT r FROM RoomType r WHERE r.numberOfGuests <= :numberOfGuests")
    List<RoomType> findByGuests(@Param("numberOfGuests") Integer numberOfGuests);

    // truy vấn phòng theo giá và so luong khách
    @Query("SELECT rt FROM RoomType rt WHERE rt.price <= :maxPrice AND rt.numberOfGuests <= :numberOfGuests")
    List<RoomType> findByPriceAndGuests(
            @Param("maxPrice") Double maxPrice,
            @Param("numberOfGuests") Integer numberOfGuests);

    @Query("SELECT rt FROM RoomType rt WHERE rt.hotel.id = :hotelId")
    List<RoomType> findByHotelId(@Param("hotelId") Integer hotelId);

    //lấy danh sách hotel_id từ danh sách room_id
    @Query("SELECT rt.hotel.id FROM RoomType rt WHERE rt.id IN :roomIds")
    List<Integer> findHotelIdsByRoomIds(@Param("roomIds") List<Integer> roomIds);

    @Query(value = "SELECT * FROM room_types WHERE hotel_id IN :hotelIds", nativeQuery = true)
    List<RoomType> findByHotelIds(@Param("hotelIds") List<Integer> hotelIds);

    //CAST(:queryEmbedding AS vector) để chuyển queryEmbedding từ kiểu character varying (chuỗi) thành kiểu vector
    @Query(value = """
        SELECT 
            re.room_id,
            re.embedding,
            (1 - (re.embedding <=> CAST(:queryEmbedding AS vector))) AS similarity
        FROM room_embeddings re
        WHERE (1 - (re.embedding <=> CAST(:queryEmbedding AS vector))) >=   :threshold
        ORDER BY similarity DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> findTopSimilarRooms(
            @Param("queryEmbedding") String queryEmbedding,
            @Param("threshold") double threshold,
            @Param("limit") int limit);

    @Query(value = """
    SELECT re.room_id, re.hotel_id,
            1 - (re.embedding <=> CAST(:queryEmbeddingStr AS vector)) AS similarity
    FROM room_embeddings re
    WHERE 1 - (re.embedding <=> CAST(:queryEmbeddingStr AS vector)) >= :similarityThreshold
    ORDER BY similarity DESC
    LIMIT :limit
    """, nativeQuery = true)
    List<Object[]> findTopSimilarRoomsForHotels(
            String queryEmbeddingStr,
            double similarityThreshold,
            int limit
    );
    @Query(value = """
        SELECT 
            rt.id, 
            rt.name, 
            rt.price,
            (1 - (re.embedding <=> CAST(:queryEmbedding AS vector))) AS similarity
        FROM room_types rt
        JOIN room_embeddings re ON rt.id = re.room_id
        WHERE rt.hotel_id IN :hotelIds
        AND (1 - (re.embedding <=> CAST(:queryEmbedding AS vector))) >= :threshold
        ORDER BY similarity DESC
        LIMIT :limit
    """, nativeQuery = true)
    List<Object[]> findTopSimilarRoomsForHotels(
            @Param("queryEmbedding") String queryEmbedding,
            @Param("hotelIds") List<Integer> hotelIds,
            @Param("threshold") double threshold,
            @Param("limit") int limit
    );
}
