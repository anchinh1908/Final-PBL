package com.example.AI.Hotel.repository;

import com.example.AI.Hotel.model.Place;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PlaceRepository extends JpaRepository<Place, Integer> {
    boolean existsBySlug(String slug);
    Page<Place> findAll(Pageable pageable);
    Page<Place> findByTitleContainingIgnoreCase(Pageable pageable,String title);

    @Query(value = "SELECT p.id, p.title, p.rating, p.address, p.review, p.slug, " +
            "ST_AsText(p.coordinates) AS coordinates_text, p.image_url, p.description, p.service, " +
            "ST_Distance(h.coordinates, p.coordinates) AS distance_in_meters " +
            "FROM hotels h, places p " +
            "WHERE h.id = :hotelId " +
            "AND ST_DWithin(h.coordinates, p.coordinates, :maxDistance) " +
            "ORDER BY distance_in_meters " +
            "LIMIT :limit", nativeQuery = true)
    List<Object[]> findNearbyPlaces(
            @Param("hotelId") Integer hotelId,
            @Param("maxDistance") double maxDistance,
            @Param("limit") int limit);

    Optional<Place> findBySlug(String slug);

    @Query(value = """
        SELECT 
            pe.place_id,
            p.title AS place_title,
            (1 - (he.embedding <=> CAST(:queryEmbedding AS vector))) AS similarity
        FROM place_embeddings pe
        JOIN places p ON pe.place_id = p.id
        WHERE (1 - (pe.embedding <=> CAST(:queryEmbedding AS vector))) >= :threshold
        ORDER BY similarity DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> findTopSimilarPlaces(
            @Param("queryEmbedding") String queryEmbedding,
            @Param("threshold") double threshold,
            @Param("limit") int limit
    );

    @Query(value = """
        SELECT 
            p.id, 
            p.title, 
            p.address,
            (1 - (pe.embedding <=> CAST(:queryEmbedding AS vector))) AS similarity,
            ST_Distance(p.coordinates, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)) AS distance
        FROM places p
        JOIN place_embeddings pe ON p.id = pe.place_id
        WHERE (1 - (pe.embedding <=> CAST(:queryEmbedding AS vector))) >= :similarityThreshold
        AND ST_Distance(p.coordinates, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)) <= :maxDistance
        ORDER BY similarity DESC, distance ASC
        LIMIT :limit
    """, nativeQuery = true)
    List<Object[]> findTopSimilarPlacesWithDistance(
            @Param("queryEmbedding") String queryEmbedding,
            @Param("similarityThreshold") double similarityThreshold,
            @Param("lon") double lon,
            @Param("lat") double lat,
            @Param("maxDistance") double maxDistance,
            @Param("limit") int limit
    );

    // LỌC THEO QUẬN
    @Query(value = "SELECT * FROM places p " +
            "WHERE EXISTS (" +
            "    SELECT 1 " +
            "    FROM unnest(string_to_array(p.address, ',')) WITH ORDINALITY AS addr(part, idx) " +
            "    WHERE TRIM(part) ILIKE '%' || :district || '%' " +
            "    AND TRIM(part) ILIKE ANY (ARRAY['%Hải Châu%', '%Sơn Trà%', '%Thanh Khê%', '%Liên Chiểu%', '%Ngũ Hành Sơn%', '%Cẩm Lệ%', '%Hòa Vang%'])" +
            ")",
            countQuery = "SELECT COUNT(*) FROM places p " +
                    "WHERE EXISTS (" +
                    "    SELECT 1 " +
                    "    FROM unnest(string_to_array(p.address, ',')) WITH ORDINALITY AS addr(part, idx) " +
                    "    WHERE TRIM(part) ILIKE '%' || :district || '%' " +
                    "    AND TRIM(part) ILIKE ANY (ARRAY['%Hải Châu%', '%Sơn Trà%', '%Thanh Khê%', '%Liên Chiểu%', '%Ngũ Hành Sơn%', '%Cẩm Lệ%', '%Hòa Vang%'])" +
                    ")",
            nativeQuery = true)
    Page<Place> findByDistrict(@Param("district") String district, Pageable pageable);


}
