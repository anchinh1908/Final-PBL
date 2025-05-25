package com.example.AI.Hotel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class HotelSearchRequest {
    @NotBlank(message = "Câu tìm kiếm không được để trống")
    private String query;

//    private Integer limit = 10; // Default number of results
}