package com.example.AI.Hotel.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaceDTO {
    private Integer id;
    private String title;
    private Float rating;
    private String address;
    private Integer review;
    private String slug;
    private Double latitude; // Vĩ độ
    private Double longitude; // Kinh độ
    private String imageUrl;
    private String description;
    private List<Map<String, List<String>>> services;

    @JsonInclude(JsonInclude.Include.NON_NULL) // xử lý cho api trả về dữ liệu place
    private Double distanceInMeters;
}
