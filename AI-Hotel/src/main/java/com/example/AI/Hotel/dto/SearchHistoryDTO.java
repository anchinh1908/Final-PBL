package com.example.AI.Hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchHistoryDTO {
    private Integer id;
    private String queryHistory;
//    private LocalDateTime searchDate;
}
