package com.example.AI.Hotel.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @Size(min = 2, max = 100, message = "INVALID_FULLNAME_FORMAT: Full name must be between 2 and 100 characters")
    private String fullName;

    @Size(min = 10, max = 15, message = "INVALID_PHONE_FORMAT: Phone number must be between 10 and 15 characters")
    private String phoneNumber;

    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate dateOfBirth;

    @Size(max = 255, message = "INVALID_ADDRESS_FORMAT: Address must not exceed 255 characters")
    private String address;

    private String avatarUrl;
}
