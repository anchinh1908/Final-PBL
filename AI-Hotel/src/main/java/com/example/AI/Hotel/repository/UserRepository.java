package com.example.AI.Hotel.repository;

import com.example.AI.Hotel.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByProviderAndProviderId(String provider, String providerId);

    List<User> findByResetTokenExpiryBeforeAndProvider(LocalDateTime expiry, String provider);

    @Query("SELECT u FROM User u WHERE u.email = :email AND u.isDeleted = false")
    Optional<User> findByEmail(@Param("email") String email);

    @Query("SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:email) AND u.isDeleted = false")
    Optional<User> findByEmailAndIsDeletedFalse(@Param("email") String email);

    Optional<User> findByGoogleId(String googleId);

    Optional<User> findByResetToken(String resetToken);


    // Kiểm tra xem user có tồn tại không, chỉ tính các user chưa bị xóa
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.id = :id AND u.isDeleted = false")
    boolean existsByIdAndNotDeleted(@Param("id") Integer id);

    // Vô hiệu hóa tài khoản (soft delete)
    @Modifying
    @Query("UPDATE User u SET u.isDeleted = true WHERE u.id = :id")
    int softDeleteById(@Param("id") Integer id);

    // Khôi phục tài khoản
    @Modifying
    @Query("UPDATE User u SET u.isDeleted = false WHERE u.id = :id")
    int restoreById(@Param("id") Integer id);
}
