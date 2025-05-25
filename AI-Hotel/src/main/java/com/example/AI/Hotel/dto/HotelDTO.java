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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class HotelDTO {
    private Integer id;
    private String name;
    private String address;
    private String district;
    private String description;
    private String hotelLink;
    private Integer ratingStars;
    private List<String> facilities;
    private Map<String, List<String>> highlights;
    private Map<String, Double> reviews;
    private List<String> imageUrls;
    private Map<String, List<String>> roomServices;
    private String slug;
    private Double latitude; // Vĩ độ
    private Double longitude; // Kinh độ

    @JsonInclude(JsonInclude.Include.NON_NULL) // xử lý cho api trả về dữ liệu hotel
    private Double distanceInMeters;
}
