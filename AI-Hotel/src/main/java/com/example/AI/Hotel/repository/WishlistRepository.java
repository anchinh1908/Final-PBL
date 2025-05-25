package com.example.AI.Hotel.repository;

import com.example.AI.Hotel.model.Wishlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Integer> {
    Page<Wishlist> findByUserId(Integer userId, Pageable pageable);
    Optional<Wishlist> findByUserIdAndHotelId(Integer userId, Integer hotelId);
}