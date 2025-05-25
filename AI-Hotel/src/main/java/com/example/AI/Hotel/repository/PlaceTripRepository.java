package com.example.AI.Hotel.repository;
import com.example.AI.Hotel.model.PlaceTrip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PlaceTripRepository extends JpaRepository<PlaceTrip, Integer>{

    @Query("SELECT pt FROM PlaceTrip pt WHERE pt.id = :id AND pt.userId = :userId")
    Optional<PlaceTrip> findByIdAndUserId(@Param("id") Integer id, @Param("userId") Integer userId);

    @Query("SELECT pt FROM PlaceTrip pt WHERE pt.userId = :userId AND pt.placeId = :placeId")
    Optional<PlaceTrip> findByUserIdAndPlaceId(@Param("userId") Integer userId, @Param("placeId") Integer placeId);
}
