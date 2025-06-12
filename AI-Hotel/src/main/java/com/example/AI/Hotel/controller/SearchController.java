package com.example.AI.Hotel.controller;

import com.example.AI.Hotel.dto.HotelSearchRequest;
import com.example.AI.Hotel.dto.HotelSearchResponse;
import com.example.AI.Hotel.service.HotelSearchService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/search")
public class SearchController {

    private final HotelSearchService hotelSearchService;

    @Autowired
    public SearchController(HotelSearchService hotelSearchService) {
        this.hotelSearchService = hotelSearchService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> searchHotels(
            @Valid @RequestBody HotelSearchRequest request,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest httpRequest) {
        List<HotelSearchResponse> responses = hotelSearchService.searchHotels(request, httpRequest);
        log.info("Search completed for query: {}, found {} hotels", request.getQuery(), responses.size());

        // Kiểm tra số lượng phòng trong các khách sạn
        boolean hasRooms = responses.stream().anyMatch(response -> !response.getRooms().isEmpty());
        log.debug("Search result contains rooms: {}", hasRooms);

        Pageable pageable = PageRequest.of(page - 1, size);
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), responses.size());
        List<HotelSearchResponse> pagedResponses = start < responses.size()
                ? responses.subList(start, end)
                : List.of();

        Page<HotelSearchResponse> pagedResult = new PageImpl<>(pagedResponses, pageable, responses.size());

        // Tạo phản hồi
        Map<String, Object> response = new HashMap<>();
        response.put("hotels", pagedResult.getContent());
        response.put("currentPage", pagedResult.getNumber() + 1); // Chuyển về one-based index
        response.put("totalItems", pagedResult.getTotalElements());
        response.put("totalPages", pagedResult.getTotalPages());
        response.put("hasRooms", hasRooms);

        if (pagedResponses.isEmpty() && responses.isEmpty()) {
            log.warn("No hotels found for query: {}", request.getQuery());
            response.put("message", "Không tìm thấy khách sạn phù hợp");
            return ResponseEntity.status(404).body(response);
        } else if (pagedResponses.isEmpty() && !hasRooms) {
            log.warn("No rooms found for query: {}, but hotels exist", request.getQuery());
            response.put("message", "Không tìm thấy phòng phù hợp với yêu cầu");
            return ResponseEntity.status(404).body(response);
        }

        return ResponseEntity.ok(response);
    }
}