package com.example.AI.Hotel.repository;
import com.example.AI.Hotel.model.SearchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Integer> {
    List<SearchHistory> findByUserId(Integer userId);
}