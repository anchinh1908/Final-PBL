package com.example.AI.Hotel.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "search_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "query", columnDefinition = "TEXT")
    private String queryHistory;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "search_timestamp")
    private LocalDateTime searchDate;

    public SearchHistory(User user, String queryHistory) {
        this.user = user;
        this.queryHistory = queryHistory;
        this.searchDate = LocalDateTime.now();
    }
}
