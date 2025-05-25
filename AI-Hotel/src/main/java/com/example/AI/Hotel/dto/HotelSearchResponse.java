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
public class HotelSearchResponse {

    private HotelDTO hotel;
    private Double similarityScore;
    private List<RoomDTO> rooms;
    private List<PlaceDTO> places;
}
