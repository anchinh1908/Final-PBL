package com.example.AI.Hotel.controller;

import com.example.AI.Hotel.dto.*;
import com.example.AI.Hotel.model.RoomType;
import com.example.AI.Hotel.repository.RoomRepository;
import com.example.AI.Hotel.service.HotelSearchService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/hotels")
public class HotelSearchController {
    private final HotelSearchService hotelSearchService;
    private final RoomRepository roomRepository;

    @Autowired
    public HotelSearchController(HotelSearchService hotelSearchService, RoomRepository roomRepository) {
        this.hotelSearchService = hotelSearchService;
        this.roomRepository = roomRepository;
    }

//    @PostMapping("/search")
//    public ResponseEntity<Map<String, Object>> searchHotels(
//            @Valid @RequestBody HotelSearchRequest request,
//            @RequestParam(defaultValue = "1") int page,
//            @RequestParam(defaultValue = "20") int size,
//            HttpServletRequest httpRequest) {
//        List<HotelSearchResponse> responses = hotelSearchService.searchHotels(request, httpRequest);
//        log.info("Search completed for query: {}, found {} hotels", request.getQuery(), responses.size());
//
//        // Kiểm tra số lượng phòng trong các khách sạn
//        boolean hasRooms = responses.stream().anyMatch(response -> !response.getRooms().isEmpty());
//        log.debug("Search result contains rooms: {}", hasRooms);
//
//        Pageable pageable = PageRequest.of(page - 1, size);
//        int start = (int) pageable.getOffset();
//        int end = Math.min(start + pageable.getPageSize(), responses.size());
//        List<HotelSearchResponse> pagedResponses = start < responses.size()
//                ? responses.subList(start, end)
//                : List.of();
//
//        Page<HotelSearchResponse> pagedResult = new PageImpl<>(pagedResponses, pageable, responses.size());
//
//        // Tạo phản hồi
//        Map<String, Object> response = new HashMap<>();
//        response.put("hotels", pagedResult.getContent());
//        response.put("currentPage", pagedResult.getNumber() + 1); // Chuyển về one-based index (bắt đầu từ 1)
//        response.put("totalItems", pagedResult.getTotalElements());
//        response.put("totalPages", pagedResult.getTotalPages());
//        response.put("hasRooms", hasRooms); // Thêm thông tin về trạng thái phòng
//
//        if (pagedResponses.isEmpty() && responses.isEmpty()) {
//            log.warn("No hotels found for query: {}", request.getQuery());
//            response.put("message", "Không tìm thấy khách sạn phù hợp");
//            return ResponseEntity.status(404).body(response);
//        } else if (pagedResponses.isEmpty() && !hasRooms) {
//            log.warn("No rooms found for query: {}, but hotels exist", request.getQuery());
//            response.put("message", "Không tìm thấy phòng phù hợp với yêu cầu");
//            return ResponseEntity.status(404).body(response);
//        }
//
//        return ResponseEntity.ok(response);
//    }
    // API tìm kiếm khách sạn (không bao gồm rooms)
    @PostMapping("/search/v2")
    public ResponseEntity<Map<String, Object>> searchHotelsV2(
            @Valid @RequestBody HotelSearchRequest request,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            List<HotelSearchResponse> responses = hotelSearchService.searchHotelsV2(request);
            log.info("Search completed for query (v2): {}, found {} hotels", request.getQuery(), responses.size());

            // Xử lý phân trang
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
            response.put("currentPage", pagedResult.getNumber() + 1); // Chuyển về index bắt đầu từ 1
            response.put("totalItems", pagedResult.getTotalElements());
            response.put("totalPages", pagedResult.getTotalPages());

            if (pagedResponses.isEmpty() && responses.isEmpty()) {
                log.warn("No hotels found for query (v2): {}", request.getQuery());
                response.put("message", "Không tìm thấy khách sạn phù hợp");
                return ResponseEntity.status(404).body(response);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error searching hotels (v2): {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Lỗi máy chủ: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // API lấy danh sách phòng theo hotelId
    @GetMapping("/{hotelId}/rooms")
    public ResponseEntity<Map<String, Object>> getRoomsByHotelId(@PathVariable Integer hotelId) {
        try {
            List<RoomType> rooms = roomRepository.findByHotelId(hotelId);
            if (rooms.isEmpty()) {
                log.warn("No rooms found for hotel ID: {}", hotelId);
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Không tìm thấy phòng cho khách sạn này");
                response.put("rooms", List.of());
                return ResponseEntity.status(404).body(response);
            }

            List<RoomDTO> roomDTOs = rooms.stream()
                    .map(this::toRoomDTO)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("rooms", roomDTOs);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching rooms for hotel ID: {}", hotelId, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Lỗi máy chủ: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/{hotelId}/nearby-places")
    public ResponseEntity<Map<String, Object>> getNearbyPlaces(
            @PathVariable Integer hotelId,
            @RequestParam(required = false) Double maxDistance,
            @RequestParam(required = false) Integer limit) {
        try {
            List<PlaceDTO> nearbyPlaces = hotelSearchService.findNearbyPlaces(hotelId, maxDistance, limit);
            Map<String, Object> response = new HashMap<>();

            if (nearbyPlaces.isEmpty()) {
                log.warn("No nearby places found for hotelId: {}", hotelId);
                response.put("message", "Không tìm thấy địa điểm dưới 5km gần khách sạn");
                response.put("places", nearbyPlaces);
                return ResponseEntity.status(404).body(response);
            }

            response.put("places", nearbyPlaces);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error finding nearby places for hotelId: {}", hotelId, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Lỗi máy chủ: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    @GetMapping("/{placeId}/nearby-hotels")
    public ResponseEntity<Map<String, Object>> getNearbyHotels(
            @PathVariable Integer placeId,
            @RequestParam(required = false) Double maxDistance,
            @RequestParam(required = false) Integer limit) {
        try {
            List<HotelDTO> nearbyHotels = hotelSearchService.findNearbyHotels(placeId, maxDistance, limit);
            Map<String, Object> response = new HashMap<>();

            if (nearbyHotels.isEmpty()) {
                log.warn("No nearby hotels found for placeId: {}", placeId);
                response.put("message", "Không tìm thấy khách sạn dưới 5km gần địa điểm");
                response.put("hotels", nearbyHotels);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            response.put("hotels", nearbyHotels);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error finding nearby hotels for placeId: {}", placeId, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Lỗi máy chủ: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/search-by-price-guests-district")
    public ResponseEntity<Map<String, Object>> searchHotelsByPriceGuestsAndDistrict(
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) Integer numberOfGuests,
            @RequestParam(required = false) String district,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<HotelSearchResponse> results = hotelSearchService.searchHotelsByPriceGuestsAndDistrict(maxPrice, numberOfGuests, district);
        log.info("Search completed for maxPrice: {}, numberOfGuests: {}, district: {}, found {} hotels",
                maxPrice, numberOfGuests, district, results.size());

        Pageable pageable = PageRequest.of(page - 1, size);
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), results.size());
        List<HotelSearchResponse> pagedResults = start < results.size()
                ? results.subList(start, end)
                : List.of();

        Page<HotelSearchResponse> pagedResult = new PageImpl<>(pagedResults, pageable, results.size());

        // Tạo phản hồi
        Map<String, Object> response = new HashMap<>();
        response.put("hotels", pagedResult.getContent());
        response.put("currentPage", pagedResult.getNumber() + 1); // Chuyển về one-based index (bắt đầu từ 1)
        response.put("totalItems", pagedResult.getTotalElements());
        response.put("totalPages", pagedResult.getTotalPages());

        if (pagedResults.isEmpty() && results.isEmpty()) {
            log.warn("No hotels found for maxPrice: {}, numberOfGuests: {}, district: {}", maxPrice, numberOfGuests, district);
            response.put("message", "Không tìm thấy khách sạn phù hợp với tiêu chí");
            return ResponseEntity.status(404).body(response);
        }

        return ResponseEntity.ok(response);
    }

    // Xử lý lỗi validation
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        log.warn("Validation failed for request: {}", errors);
        return ResponseEntity.status(400).body(errors);
    }

    // Xử lý ngoại lệ IllegalArgumentException
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("Invalid input: {}", ex.getMessage());

        Map<String, String> errorResponse = new HashMap<>();
        String errorMessage = ex.getMessage();

        switch (errorMessage) {
            case "maxPrice must be a positive value":
                errorResponse.put("message", "Giá tối đa phải là một số dương");
                break;
            case "numberOfGuests must be a positive value":
                errorResponse.put("message", "Số lượng khách phải là một số dương");
                break;
            case "At least one search criterion (maxPrice, numberOfGuests, or district) must be provided":
                errorResponse.put("message", "Vui lòng cung cấp ít nhất một tiêu chí tìm kiếm (giá tối đa, số lượng khách, hoặc quận)");
                break;
            case "Failed to process search query":
                errorResponse.put("message", "Không thể xử lý yêu cầu tìm kiếm. Vui lòng kiểm tra lại thông tin tìm kiếm.");
                break;
            case "Page index must not be less than one!":
                errorResponse.put("message", "Số trang phải lớn hơn hoặc bằng 1");
                break;
            default:
                if (errorMessage.startsWith("District must be one of:")) {
                    errorResponse.put("message", "Quận không hợp lệ. Vui lòng chọn một trong các quận sau: Liên Chiểu, Hải Châu, Thanh Khê, Sơn Trà, Ngũ Hành Sơn, Cẩm Lệ");
                } else {
                    errorResponse.put("message", errorMessage);
                }
        }

        return ResponseEntity.status(400).body(errorResponse);
    }

    // Xử lý các ngoại lệ chung (lỗi máy chủ)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralException(Exception ex) {
        log.error("Unexpected error occurred: {}", ex.getMessage(), ex);

        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.");

        return ResponseEntity.status(500).body(errorResponse);
    }

    private RoomDTO toRoomDTO(RoomType roomType) {
        RoomDTO roomDTO = new RoomDTO();
        roomDTO.setId(roomType.getId());
        roomDTO.setHotelId(roomType.getHotel().getId());
        roomDTO.setName(roomType.getName());
        roomDTO.setNumberOfGuests(roomType.getNumberOfGuests());
        roomDTO.setPrice(roomType.getPrice());
        roomDTO.setOriginalPrice(roomType.getOriginalPrice());
        roomDTO.setTaxesAndFeesUnderPrice(roomType.getTaxesAndFeesUnderPrice());
        return roomDTO;
    }

    //Tìm kiếm khách sạn theo giá, số lượng khách, và quận( bắt buộc điền cả 3 trường)
    /*
    @GetMapping("/search-by-price-guests-district")
    public ResponseEntity<Map<String, Object>> searchHotelsByPriceGuestsAndDistrict(
            @RequestParam Integer maxPrice,
            @RequestParam Integer numberOfGuests,
            @RequestParam(required = false) String district,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            List<HotelSearchResponse> results = hotelSearchService.searchHotelsByPriceGuestsAndDistrict(maxPrice, numberOfGuests, district);
            log.info("Search completed for maxPrice: {}, numberOfGuests: {}, district: {}, found {} hotels",
                    maxPrice, numberOfGuests, district, results.size());

            // Phân trang kết quả
            Pageable pageable = PageRequest.of(page, size);
            int start = (int) pageable.getOffset();
            int end = Math.min(start + pageable.getPageSize(), results.size());
            List<HotelSearchResponse> pagedResults = start < results.size()
                    ? results.subList(start, end)
                    : List.of();

            Page<HotelSearchResponse> pagedResult = new PageImpl<>(pagedResults, pageable, results.size());

            // Tạo phản hồi
            Map<String, Object> response = new HashMap<>();
            response.put("hotels", pagedResult.getContent());
            response.put("currentPage", pagedResult.getNumber());
            response.put("totalItems", pagedResult.getTotalElements());
            response.put("totalPages", pagedResult.getTotalPages());

            if (pagedResults.isEmpty() && results.isEmpty()) {
                log.warn("No hotels found for maxPrice: {}, numberOfGuests: {}, district: {}", maxPrice, numberOfGuests, district);
                response.put("message", "Không tìm thấy khách sạn phù hợp với giá, số lượng khách và quận");
                return ResponseEntity.status(404).body(response);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error searching hotels by price, guests, and district: maxPrice={}, numberOfGuests={}, district={}",
                    maxPrice, numberOfGuests, district, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi máy chủ: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    */
}