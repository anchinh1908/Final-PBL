package com.example.AI.Hotel.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {
//    private Integer userId;

    @NotNull(message = "Room ID là bắt buộc")
    private Integer roomId;

    @NotNull(message = "Ngày nhân phòng là bắt buộc ")
    @FutureOrPresent(message = "Ngày nhận phòng phải bắt đầu từ hôm nay ")
    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate checkInDate;

    @NotNull(message = "Ngày trả phòng là bắt buộc")
    @Future(message = "Ngày trả phòng không hợp lệ")
    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate checkOutDate;

//    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
//    private LocalDateTime bookingTime;
}
