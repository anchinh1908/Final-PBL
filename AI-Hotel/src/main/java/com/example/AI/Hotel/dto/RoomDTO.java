package com.example.AI.Hotel.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RoomDTO {
    private Integer id;
    private Integer hotelId;
    private String name;
    private Integer numberOfGuests;
    private Integer price;
    private Integer originalPrice;
    private Boolean taxesAndFeesUnderPrice;

    private Double similarityScore;
}
