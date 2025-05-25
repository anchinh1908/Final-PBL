package com.example.AI.Hotel.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String email;

    private String password;

    private String fullName;

    private String phoneNumber;

    @Column(name = "date_of_birth", columnDefinition = "DATE")
    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate dateOfBirth;

    private String address;

    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(unique = true)
    private String googleId;

    // Trường mới để lưu OTP
    @Column(name = "reset_token", length = 32)
    private String resetToken;

    // Trường mới để lưu thời gian hết hạn của OTP
    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    public enum Role {
        USER, ADMIN
    }

}
