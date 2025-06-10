package com.example.AI.Hotel.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmbeddingRequest {
    @JsonProperty("hotel_data")
    private List<HotelDTO> hotelData;

    @JsonProperty("room_data")
    private List<RoomDTO> roomData;

    @JsonProperty("place_data")
    private List<PlaceDTO> placeData;

    private String type;

    public EmbeddingRequest(List<?> data, String type) {
        this.type = type;
        if ("hotel".equals(type)) {
            this.hotelData = (List<HotelDTO>) data;
            this.roomData = null;
            this.placeData = null;
        } else if ("room".equals(type)) {
            this.roomData = (List<RoomDTO>) data;
            this.hotelData = null;
            this.placeData = null;
        } else if ("place".equals(type)) {
            this.placeData = (List<PlaceDTO>) data;
            this.hotelData = null;
            this.roomData = null;
        } else {
            this.hotelData = null;
            this.roomData = null;
            this.placeData = null;
        }
    }

}