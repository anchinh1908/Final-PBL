package com.example.AI.Hotel.controller;

import com.example.AI.Hotel.dto.*;
import com.example.AI.Hotel.model.Hotel;
import com.example.AI.Hotel.model.Place;
import com.example.AI.Hotel.model.RoomType;
import com.example.AI.Hotel.model.User;
import com.example.AI.Hotel.repository.UserRepository;
import com.example.AI.Hotel.service.AdminService;
import com.example.AI.Hotel.service.HotelDataService;
import com.example.AI.Hotel.service.UserService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.example.AI.Hotel.controller.HotelDataController.buildErrorResponse;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    private final AdminService adminService;
    private final ObjectMapper objectMapper;
    private final UserService userService;
    private final HotelDataService hotelDataService;
    private final UserRepository userRepository;

    @Autowired
    public AdminController(AdminService adminService, @Qualifier("objectMapper") ObjectMapper objectMapper, UserRepository userRepository, UserService userService, HotelDataService hotelDataService, UserRepository userRepository1) {
        this.adminService = adminService;
        this.objectMapper = objectMapper;
        this.userService = userService;
        this.hotelDataService = hotelDataService;
        this.userRepository = userRepository1;
    }

    @PutMapping("/users/{userId}/disable")
    public ResponseEntity<Map<String, Object>> disableUser(@PathVariable Integer userId) {
        try {
            adminService.disableUser(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Tài khoản ngươi dùng với ID " + userId + " đã bị vô hiệu hóa thành công");
            response.put("status", HttpStatus.OK.value());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Failed to disable user with ID {}: {}", userId, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.NOT_FOUND.value());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (SecurityException e) {
            logger.warn("Unauthorized attempt to disable user with ID {}: {}", userId, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.FORBIDDEN.value());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);

        } catch (Exception e) {
            logger.error("Error disabling user with ID {}: {}", userId, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Server error: " + e.getMessage());
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/users/{userId}/restore")
    public ResponseEntity<Map<String, Object>> restoreUser(@PathVariable Integer userId) {
        try {
            adminService.restoreUser(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Tài khoản người dùng vơi ID " + userId + " đã được khôi phục thành công");
            response.put("status", HttpStatus.OK.value());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException | IllegalStateException e) {
            logger.warn("Failed to restore user with ID {}: {}", userId, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);

        } catch (SecurityException e) {
            logger.warn("Unauthorized attempt to restore user with ID {}: {}", userId, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.FORBIDDEN.value());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);

        } catch (Exception e) {
            logger.error("Error restoring user with ID {}: {}", userId, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Server error: " + e.getMessage());
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

//    @PostMapping(value = "/add-hotels", consumes = "multipart/form-data")
//    public ResponseEntity<Map<String, Object>> addHotel(
//            @RequestParam("name") String name,
//            @RequestParam("address") String address,
//            @RequestParam("district") String district,
//            @RequestParam(value = "description", required = false) String description,
//            @RequestParam(value = "hotelLink", required = false) String hotelLink,
//            @RequestParam(value = "ratingStars", required = false) Integer ratingStars,
//            @RequestParam(value = "facilities", required = false) String facilities,
//            @RequestParam(value = "highlights", required = false) String highlights,
//            @RequestParam(value = "reviews", required = false) String reviews,
//            @RequestParam(value = "roomServices", required = false) String roomServices,
//            @RequestParam(value = "slug", required = false) String slug,
//            @RequestParam(value = "latitude", required = false) Double latitude,
//            @RequestParam(value = "longitude", required = false) Double longitude,
//            @RequestParam(value = "images", required = false) MultipartFile[] images) {
//        try {
//            // Kiểm tra các trường bắt buộc
//            if (name == null || name.trim().isEmpty()) {
//                throw new IllegalArgumentException("Tên khách sạn là bắt buộc");
//            }
//            if (address == null || address.trim().isEmpty()) {
//                throw new IllegalArgumentException("Địa chỉ khách sạn là bắt buộc");
//            }
//            if (district == null || district.trim().isEmpty()) {
//                throw new IllegalArgumentException("Quận khách sạn là bắt buộc");
//            }
//
//            // Khởi tạo ObjectMapper để kiểm tra JSON
//            ObjectMapper objectMapper = new ObjectMapper();
//
//            // Kiểm tra định dạng facilities (List<String>)
//            List<String> parsedFacilities = null;
//            if (facilities != null && !facilities.trim().isEmpty()) {
//                try {
//                    parsedFacilities = objectMapper.readValue(facilities, new TypeReference<List<String>>() {});
//                } catch (JsonProcessingException e) {
//                    throw new IllegalArgumentException("Định dạng của facilities không hợp lệ");
//                }
//            }
//
//            // Kiểm tra định dạng highlights (Map<String, List<String>>)
//            Map<String, List<String>> parsedHighlights = null;
//            if (highlights != null && !highlights.trim().isEmpty()) {
//                try {
//                    parsedHighlights = objectMapper.readValue(highlights, new TypeReference<Map<String, List<String>>>() {});
//                } catch (JsonProcessingException e) {
//                    throw new IllegalArgumentException("Định dạng của highlights không hợp lệ)");
//                }
//            }
//
//            // Kiểm tra định dạng reviews (Map<String, Double>)
//            Map<String, Double> parsedReviews = null;
//            if (reviews != null && !reviews.trim().isEmpty()) {
//                try {
//                    parsedReviews = objectMapper.readValue(reviews, new TypeReference<Map<String, Double>>() {});
//                } catch (JsonProcessingException e) {
//                    throw new IllegalArgumentException("Định dạng của reviews không hợp lệ");
//                }
//            }
//
//            // Kiểm tra định dạng roomServices (Map<String, List<String>>)
//            Map<String, List<String>> parsedRoomServices = null;
//            if (roomServices != null && !roomServices.trim().isEmpty()) {
//                try {
//                    parsedRoomServices = objectMapper.readValue(roomServices, new TypeReference<Map<String, List<String>>>() {});
//                } catch (JsonProcessingException e) {
//                    throw new IllegalArgumentException("Định dạng của roomServices không hợp lệ");
//                }
//            }
//
//            // Kiểm tra images (MultipartFile[])
//            if (images != null) {
//                for (MultipartFile image : images) {
//                    if (image != null && !image.isEmpty()) {
//                        String contentType = image.getContentType();
//                        if (contentType == null || !contentType.matches("image/(jpeg|png|jpg)")) {
//                            throw new IllegalArgumentException("Hình ảnh không hợp lệ: " + image.getOriginalFilename() + ". Chỉ hỗ trợ định dạng JPEG, PNG hoặc JPG.");
//                        }
//                    }
//                }
//            }
//
//            // Tạo HotelDTO từ các tham số
//            HotelDTO hotelDTO = new HotelDTO();
//            hotelDTO.setName(name);
//            hotelDTO.setAddress(address);
//            hotelDTO.setDistrict(district);
//            hotelDTO.setDescription(description);
//            hotelDTO.setHotelLink(hotelLink);
//            hotelDTO.setRatingStars(ratingStars);
//            hotelDTO.setFacilities(parsedFacilities);
//            hotelDTO.setHighlights(parsedHighlights);
//            hotelDTO.setReviews(parsedReviews);
//            hotelDTO.setRoomServices(parsedRoomServices);
//            hotelDTO.setSlug(slug);
//            hotelDTO.setLatitude(latitude);
//            hotelDTO.setLongitude(longitude);
//
//            // Gọi service để thêm khách sạn
//            Hotel addedHotel = adminService.addHotel(hotelDTO, images);
//
//            Map<String, Object> response = new HashMap<>();
//            response.put("message", "Khách sạn với ID " + addedHotel.getId() + " đã được thêm thành công");
//            response.put("hotelId", addedHotel.getId());
//            response.put("status", HttpStatus.CREATED.value());
//            return ResponseEntity.status(HttpStatus.CREATED).body(response);
//
//        } catch (IllegalArgumentException e) {
//            logger.warn("Failed to add hotel: {}", e.getMessage());
//            Map<String, Object> errorResponse = new HashMap<>();
//            errorResponse.put("message", e.getMessage());
//            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
//        } catch (SecurityException e) {
//            logger.warn("Unauthorized attempt to add hotel: {}", e.getMessage());
//            Map<String, Object> errorResponse = new HashMap<>();
//            errorResponse.put("message", e.getMessage());
//            errorResponse.put("status", HttpStatus.FORBIDDEN.value());
//            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
//        } catch (Exception e) {
//            logger.error("Error adding hotel: {}", e.getMessage());
//            Map<String, Object> errorResponse = new HashMap<>();
//            errorResponse.put("message", "Lỗi server: " + e.getMessage());
//            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
//        }
//    }

    @PostMapping(value = "/add-hotels", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> addHotel(
            @RequestParam("name") String name,
            @RequestParam("address") String address,
            @RequestParam("district") String district,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "hotelLink", required = false) String hotelLink,
            @RequestParam(value = "ratingStars", required = false) Integer ratingStars,
            @RequestParam(value = "facilities", required = false) String facilities,
            @RequestParam(value = "highlights", required = false) String highlights,
            @RequestParam(value = "reviews", required = false) String reviews,
            @RequestParam(value = "roomServices", required = false) String roomServices,
            @RequestParam(value = "slug", required = false) String slug,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "images", required = false) MultipartFile[] images) {
        try {
            // Kiểm tra các trường bắt buộc
            if (name == null || name.trim().isEmpty()) {
                throw new IllegalArgumentException("Hotel name is required");
            }
            if (address == null || address.trim().isEmpty()) {
                throw new IllegalArgumentException("Hotel address is required");
            }
            if (district == null || district.trim().isEmpty()) {
                throw new IllegalArgumentException("Hotel district is required");
            }

            // Tạo HotelDTO từ các tham số
            HotelDTO hotelDTO = new HotelDTO();
            hotelDTO.setName(name);
            hotelDTO.setAddress(address);
            hotelDTO.setDistrict(district);
            hotelDTO.setDescription(description);
            hotelDTO.setHotelLink(hotelLink);
            hotelDTO.setRatingStars(ratingStars != null ? ratingStars : 0);
            hotelDTO.setFacilities(parseJsonArray(facilities));
            hotelDTO.setHighlights(parseJsonMap(highlights));
            hotelDTO.setReviews(parseJsonMapDouble(reviews));
            hotelDTO.setRoomServices(parseJsonMap(roomServices));
            hotelDTO.setSlug(slug);
            hotelDTO.setLatitude(latitude);
            hotelDTO.setLongitude(longitude);

            // Gọi service để thêm khách sạn
            Hotel addedHotel = adminService.addHotel(hotelDTO, images);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Khách sạn với ID " + addedHotel.getId() + " đã được thêm thành công");
            response.put("hotelId", addedHotel.getId());
            response.put("status", HttpStatus.CREATED.value());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Failed to add hotel: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (SecurityException e) {
            logger.warn("Unauthorized attempt to add hotel: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.FORBIDDEN.value());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        } catch (Exception e) {
            logger.error("Error adding hotel: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "" + e.getMessage());
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("user/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Integer id) {
        try {
            UserDTO user = userService.getUserById(id);
            return HotelDataController.buildDetailResponse(user, "user", "Không tìm thấy khách sạn với id: " + id);
        } catch (Exception e) {
//            log.error("Error fetching hotel with id: {}", id, e);
            return buildErrorResponse(e);
        }
    }

    @DeleteMapping("/delete-user/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();

        if (!userRepository.existsById(id)) {
            response.put("message", "Người dùng không tồn tại");
            response.put("status", HttpStatus.NOT_FOUND.value());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        userRepository.deleteById(id);

        response.put("message", "Người dùng đã được xóa thành công");
        response.put("status", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/delete-users")
    public ResponseEntity<Map<String, Object>> deleteUsers(@RequestParam("userIds") List<Integer> ids) {
        Map<String, Object> response = new HashMap<>();

        if (ids == null || ids.isEmpty()) {
            response.put("message", "Danh sách ID không được trống");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // Kiểm tra xem có user nào tồn tại không
        List<User> users = userRepository.findAllById(ids);
        if (users.isEmpty()) {
            response.put("message", "Không tìm thấy người dùng nào hợp lệ để xóa");
            response.put("status", HttpStatus.NOT_FOUND.value());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        // Xóa các user
        userRepository.deleteAll(users);

        response.put("message", "Đã xóa thành công " + users.size() + " người dùng");
        response.put("status", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }

    @PutMapping(value = "update-hotel/{hotelId}", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> updateHotel(
            @PathVariable Integer hotelId,
            @RequestParam("name") String name,
            @RequestParam("address") String address,
            @RequestParam("district") String district,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "hotelLink", required = false) String hotelLink,
            @RequestParam(value = "ratingStars", required = false) Integer ratingStars,
            @RequestParam(value = "facilities", required = false) String facilities,
            @RequestParam(value = "highlights", required = false) String highlights,
            @RequestParam(value = "reviews", required = false) String reviews,
            @RequestParam(value = "roomServices", required = false) String roomServices,
            @RequestParam(value = "slug", required = false) String slug,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "images", required = false) String images) {
        try {
            // Kiểm tra các trường bắt buộc
            if (name == null || name.trim().isEmpty()) {
                throw new IllegalArgumentException("Hotel name is required");
            }
            if (address == null || address.trim().isEmpty()) {
                throw new IllegalArgumentException("Hotel address is required");
            }
            if (district == null || district.trim().isEmpty()) {
                throw new IllegalArgumentException("Hotel district is required");
            }

            // Tạo HotelDTO từ các tham số
            HotelDTO hotelDTO = new HotelDTO();
            hotelDTO.setName(name);
            hotelDTO.setAddress(address);
            hotelDTO.setDistrict(district);
            hotelDTO.setDescription(description);
            hotelDTO.setHotelLink(hotelLink);
            hotelDTO.setRatingStars(ratingStars != null ? ratingStars : 0);
            hotelDTO.setFacilities(parseJsonArray(facilities));
            hotelDTO.setHighlights(parseJsonMap(highlights));
            hotelDTO.setReviews(parseJsonMapDouble(reviews));
            hotelDTO.setRoomServices(parseJsonMap(roomServices));
            hotelDTO.setImageUrls(parseJsonArray(images));
            hotelDTO.setSlug(slug);
            hotelDTO.setLatitude(latitude);
            hotelDTO.setLongitude(longitude);

            // Gọi service để cập nhật khách sạn
            Hotel updatedHotel = adminService.updateHotel(hotelId, hotelDTO);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Khách sạn với ID " + updatedHotel.getId() + " đã được cập nhật thành công ");
            response.put("hotelId", updatedHotel.getId());
            response.put("status", HttpStatus.OK.value());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Failed to update hotel: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (SecurityException e) {
            logger.warn("Unauthorized attempt to update hotel: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.FORBIDDEN.value());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        } catch (Exception e) {
            logger.error("Error updating hotel: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "" + e.getMessage());
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }

    }

    @DeleteMapping("delete-hotel/{hotelId}")
    public ResponseEntity<Map<String, Object>> deleteHotel(@PathVariable Integer hotelId) {
        try {
            adminService.deleteHotel(hotelId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Khách sạn với ID " + hotelId + " đã được xóa thành công");
            response.put("hotelId", hotelId);
            response.put("status", HttpStatus.OK.value());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Failed to delete hotel: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (SecurityException e) {
            logger.warn("Unauthorized attempt to delete hotel: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.FORBIDDEN.value());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        } catch (Exception e) {
            logger.error("Error deleting hotel: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Server error: " + e.getMessage());
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("delete-hotels")
    public ResponseEntity<Map<String, Object>> deleteHotels(
            @RequestParam("hotelIds") List<Integer> hotelIds) {
        try {
            adminService.deleteHotels(hotelIds);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Các khách sạn với ID " + hotelIds + " đã được xóa thành công");
            response.put("hotelIds", hotelIds);
            response.put("status", HttpStatus.OK.value());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Failed to delete hotels: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (SecurityException e) {
            logger.warn("Unauthorized attempt to delete hotels: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.FORBIDDEN.value());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        } catch (Exception e) {
            logger.error("Error deleting hotels: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Server error: " + e.getMessage());
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("delete-places")
    public ResponseEntity<Map<String, Object>> deletePlaces(
            @RequestParam("placeIds") List<Integer> placeIds) {
        try {
            adminService.deletePlaces(placeIds);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Các địa điểm với ID " + placeIds + " đã được xóa thành công");
            response.put("placeIds", placeIds);
            response.put("status", HttpStatus.OK.value());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Failed to delete places: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (SecurityException e) {
            logger.warn("Unauthorized attempt to delete places: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.FORBIDDEN.value());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        } catch (Exception e) {
            logger.error("Error deleting places: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Server error: " + e.getMessage());
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    @DeleteMapping("delete-rooms")
    public ResponseEntity<Map<String, Object>> deleteRooms(
            @RequestParam("roomIds") List<Integer> roomIds) {
        try {
            adminService.deleteRooms(roomIds);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Các địa điểm với ID " + roomIds + " đã được xóa thành công");
            response.put("placeIds", roomIds);
            response.put("status", HttpStatus.OK.value());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Failed to delete places: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (SecurityException e) {
            logger.warn("Unauthorized attempt to delete places: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.FORBIDDEN.value());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        } catch (Exception e) {
            logger.error("Error deleting places: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Server error: " + e.getMessage());
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping(value = "/add-room", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> addRoom(
            @RequestParam("hotelId") Integer hotelId,
            @RequestParam("name") String name,
            @RequestParam(value = "numberOfGuests", required = false) Integer numberOfGuests,
            @RequestParam(value = "price", required = false) Integer price,
            @RequestParam(value = "originalPrice", required = false) Integer originalPrice,
            @RequestParam(value = "taxesAndFeesUnderPrice", required = false) Boolean taxesAndFeesUnderPrice) {
        try {
            if (hotelId == null) {
                throw new IllegalArgumentException("Hotel ID is required");
            }
            if (name == null || name.trim().isEmpty()) {
                throw new IllegalArgumentException("Room name is required");
            }

            RoomDTO roomDTO = new RoomDTO();
            roomDTO.setHotelId(hotelId);
            roomDTO.setName(name);
            roomDTO.setNumberOfGuests(numberOfGuests);
            roomDTO.setPrice(price);
            roomDTO.setOriginalPrice(originalPrice);
            roomDTO.setTaxesAndFeesUnderPrice(taxesAndFeesUnderPrice);

            RoomType addedRoom = adminService.addRoom(roomDTO);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Phòng đã được thêm thành công cho khách sạn ID " + addedRoom.getHotel().getId());
            response.put("roomId", addedRoom.getId());
            response.put("status", HttpStatus.OK.value());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Failed to add room: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (SecurityException e) {
            logger.warn("Unauthorized attempt to add room: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.FORBIDDEN.value());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        } catch (Exception e) {
            logger.error("Error adding room: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    @PutMapping("/update-room/{roomId}")
    public ResponseEntity<?> updateRoom(
            @PathVariable Integer roomId,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "numberOfGuests", required = false) Integer numberOfGuests,
            @RequestParam(value = "price", required = false) Integer price,
            @RequestParam(value = "originalPrice", required = false) Integer originalPrice,
            @RequestParam(value = "taxesAndFeesUnderPrice", required = false) Boolean taxesAndFeesUnderPrice) {

        try {
            RoomDTO roomDTO = new RoomDTO();
            roomDTO.setName(name);
            roomDTO.setNumberOfGuests(numberOfGuests);
            roomDTO.setPrice(price);
            roomDTO.setOriginalPrice(originalPrice);
            roomDTO.setTaxesAndFeesUnderPrice(taxesAndFeesUnderPrice);

            RoomType updatedRoom = adminService.updateRoom(roomId, roomDTO);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Phòng đã được cập nhật thành công");
            response.put("roomId", updatedRoom.getId());
            response.put("status", 200);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error updating room: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Không thể cập nhật dữ liệu phòng: " + e.getMessage());
            errorResponse.put("status", 500);
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @DeleteMapping("/delete-room/{roomId}")
    public ResponseEntity<?> deleteRoom(@PathVariable Integer roomId) {
        try {
            adminService.deleteRoom(roomId);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Phòng đã được xóa thành công");
            response.put("status", 200);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error deleting room: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Không thể xóa phòng: " + e.getMessage());
            errorResponse.put("status", 500);
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping(value = "/add-place", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> addPlace(
            @RequestParam("title") String title,
            @RequestParam("address") String address,
            @RequestParam(value = "rating", required = false) Float rating,
            @RequestParam(value = "review", required = false) Integer review,
            @RequestParam(value = "slug", required = false) String slug,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "services", required = false) String services,
            @RequestParam(value = "images", required = false) MultipartFile[] images) {
        try {
            // Kiểm tra các trường bắt buộc
            if (title == null || title.trim().isEmpty()) {
                throw new IllegalArgumentException("Tiêu đề Place là bắt buộc");
            }
            if (address == null || address.trim().isEmpty()) {
                throw new IllegalArgumentException("Địa chỉ Place là bắt buộc");
            }

            // Tạo PlaceDTO từ các tham số
            PlaceDTO placeDTO = new PlaceDTO();
            placeDTO.setTitle(title);
            placeDTO.setAddress(address);
            placeDTO.setRating(rating != null ? rating : 0.0f);
            placeDTO.setReview(review != null ? review : 0);
            placeDTO.setSlug(slug);
            placeDTO.setLatitude(latitude);
            placeDTO.setLongitude(longitude); // Thêm lại latitude và longitude
            placeDTO.setDescription(description);
            placeDTO.setServices(parseJsonMapList(services));

            // Gọi service để thêm Place
            Place addedPlace = adminService.addPlace(placeDTO, images);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Địa điểm với ID " + addedPlace.getId() + " đã được thêm thành công");
            response.put("placeId", addedPlace.getId());
            response.put("status", HttpStatus.CREATED.value());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Failed to add place: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (SecurityException e) {
            logger.warn("Unauthorized attempt to add place: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.FORBIDDEN.value());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        } catch (Exception e) {
            logger.error("Error adding place: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping(value = "/update-place/{placeId}", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> updatePlace(
            @PathVariable Integer placeId,
            @RequestParam("title") String title,
            @RequestParam("address") String address,
            @RequestParam(value = "rating", required = false) Float rating,
            @RequestParam(value = "review", required = false) Integer review,
            @RequestParam(value = "slug", required = false) String slug,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "services", required = false) String services,
            @RequestParam(value = "images", required = false) String images) {
        try {
            // Kiểm tra các trường bắt buộc
            if (title == null || title.trim().isEmpty()) {
                throw new IllegalArgumentException("Tiêu đề Place là bắt buộc");
            }
            if (address == null || address.trim().isEmpty()) {
                throw new IllegalArgumentException("Địa chỉ Place là bắt buộc");
            }

            // Tạo PlaceDTO từ các tham số
            PlaceDTO placeDTO = new PlaceDTO();
            placeDTO.setId(placeId); // Sử dụng placeId từ PathVariable
            placeDTO.setTitle(title);
            placeDTO.setAddress(address);
            placeDTO.setRating(rating != null ? rating : 0.0f);
            placeDTO.setReview(review != null ? review : 0);
            placeDTO.setSlug(slug);
            placeDTO.setLatitude(latitude);
            placeDTO.setLongitude(longitude);
            placeDTO.setDescription(description);
            placeDTO.setServices(parseJsonMapList(services));
            placeDTO.setImageUrl(images);

            // Gọi service để cập nhật Place
            Place updatedPlace = adminService.updatePlace(placeDTO);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Địa điểm với ID " + updatedPlace.getId() + " đã được cập nhật thành công");
            response.put("placeId", updatedPlace.getId());
            response.put("status", HttpStatus.OK.value());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Failed to update place: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (SecurityException e) {
            logger.warn("Unauthorized attempt to update place: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.FORBIDDEN.value());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        } catch (Exception e) {
            logger.error("Error updating place: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/users")
    public ResponseEntity<Map<String, Object>> getAllUser(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            // Không cần trừ 1 từ page, vì Spring Data đã xử lý one-based index
            Page<UserDTO> userPage = userService.getAllUser(page, size);
//            userPage.getContent().forEach(user ->
//                    logger.info("User ID: {}, isDeleted: {}", user.getId(), user.isDeleted())
//            );
            return HotelDataController.buildPagedResponse(userPage, "Không tìm thấy người dùng");
        } catch (Exception e) {
            logger.error("Error fetching all rooms: page={}, size={}", page, size, e);
            return buildErrorResponse(e);
        }
    }

//    @GetMapping("/count-hotels")
//    public ResponseEntity<List<String>> getNumbersCountOfHotels() {
//        try {
//            List<String> totalHotels = hotelDataService.getNumbersCountOfHotels();
//            return ResponseEntity.ok(totalHotels);
//        } catch (Exception e) {
//            return ResponseEntity.status(500).body(Collections.singletonList("Lỗi khi đếm tổng số khách sạn: " + e.getMessage()));
//        }
//    }
    @GetMapping("/count-number")
    public ResponseEntity<Map<String, Object>> getNumbersCountOfHotels() {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Long> totalsMessage = hotelDataService.getNumbersCounts();
            response.put("Total Item", totalsMessage);
            response.put("status", "200");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Lỗi khi đếm tổng số khách sạn: " + e.getMessage());
            response.put("status", "error");
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/search-user")
    public ResponseEntity<?> searchUserByEmail(@RequestParam String email) {
        try {
            UserDTO user = userService.findUserByEmail(email);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body("{\"message\":\"" + e.getMessage() + "\", \"status\":404}");
        }
    }

    @DeleteMapping("/delete-place/{placeId}")
    public ResponseEntity<Map<String, Object>> deletePlace(@PathVariable Integer placeId) {
        try {
            adminService.deletePlace(placeId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Địa điểm với ID " + placeId + " đã được xóa thành công");
            response.put("placeId", placeId);
            response.put("status", HttpStatus.OK.value());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Không thể xóa Place: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (SecurityException e) {
            logger.warn("Không có quyền để xóa Place: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.FORBIDDEN.value());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        } catch (Exception e) {
            logger.error("Lỗi khi xóa Place: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Lỗi máy chủ: " + e.getMessage());
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/search-hotel")
    public ResponseEntity<Map<String, Object>> searchHotel(
            @RequestParam("name") String name,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            if (name == null || name.trim().isEmpty()) {
                throw new IllegalArgumentException("Tên khách sạn là bắt buộc");
            }
            if (page < 1) {
                throw new IllegalArgumentException("Số trang phải lớn hơn 0");
            }
            if (size < 1) {
                throw new IllegalArgumentException("Kích thước trang phải lớn hơn 0");
            }

            Page<HotelDTO> hotelPage = adminService.searchHotelByName(name, page, size);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Tìm thấy " + hotelPage.getTotalElements() + " khách sạn");
            response.put("hotels", hotelPage.getContent());
            response.put("currentPage", page);
            response.put("pageSize", size);
            response.put("totalItems", hotelPage.getTotalElements());
            response.put("totalPages", hotelPage.getTotalPages());
            response.put("status", HttpStatus.OK.value());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Không thể tìm kiếm khách sạn: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            logger.error("Lỗi khi tìm kiếm khách sạn: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Lỗi máy chủ: " + e.getMessage());
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    @GetMapping("/search-room")
    public ResponseEntity<Map<String, Object>> searchRoom(
            @RequestParam("name") String name,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            if (name == null || name.trim().isEmpty()) {
                throw new IllegalArgumentException("Tên phòng là bắt buộc");
            }
            if (page < 1) {
                throw new IllegalArgumentException("Số trang phải lớn hơn 0");
            }
            if (size < 1) {
                throw new IllegalArgumentException("Kích thước trang phải lớn hơn 0");
            }

            Page<RoomDTO> hotelPage = adminService.searchRoomByName(name, page, size);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Tìm thấy " + hotelPage.getTotalElements() + " phòng");
            response.put("rooms", hotelPage.getContent());
            response.put("currentPage", page);
            response.put("pageSize", size);
            response.put("totalItems", hotelPage.getTotalElements());
            response.put("totalPages", hotelPage.getTotalPages());
            response.put("status", HttpStatus.OK.value());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Không thể tìm kiếm phòng: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            logger.error("Lỗi khi tìm kiếm phòng: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Lỗi máy chủ: " + e.getMessage());
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/search-place")
    public ResponseEntity<Map<String, Object>> searchPlace(
            @RequestParam("title") String title,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            if (title == null || title.trim().isEmpty()) {
                throw new IllegalArgumentException("Tên địa điểm là bắt buộc");
            }
            if (page < 1) {
                throw new IllegalArgumentException("Số trang phải lớn hơn 0");
            }
            if (size < 1) {
                throw new IllegalArgumentException("Kích thước trang phải lớn hơn 0");
            }

            Page<PlaceDTO> placePage = adminService.searchPlaceByTitle(title, page, size);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Tìm thấy " + placePage.getTotalElements() + " địa điểm");
            response.put("place", placePage.getContent());
            response.put("currentPage", page);
            response.put("pageSize", size);
            response.put("totalItems", placePage.getTotalElements());
            response.put("totalPages", placePage.getTotalPages());
            response.put("status", HttpStatus.OK.value());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Không thể tìm kiếm địa điểm: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            logger.error("Lỗi khi tìm kiếm địa điểm: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Lỗi máy chủ: " + e.getMessage());
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Phương thức phụ để parse JSON array từ String
    private List<String> parseJsonArray(String json) {
        if (json == null || json.trim().isEmpty()) return null;
        try {
            return objectMapper.readValue(json, objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (Exception e) {
            logger.warn("Failed to parse JSON array: {}", json, e);
            return null;
        }
    }
    // Phương thức phụ để parse JSON map với value là List<String>
    private Map<String, List<String>> parseJsonMap(String json) {
        if (json == null || json.trim().isEmpty()) return null;
        try {
            return objectMapper.readValue(json, objectMapper.getTypeFactory().constructMapType(Map.class, String.class, List.class));
        } catch (Exception e) {
            logger.warn("Failed to parse JSON map: {}", json, e);
            return null;
        }
    }
    private List<Map<String, List<String>>> parseJsonMapList(String jsonString) {
        if (jsonString == null || jsonString.trim().isEmpty()) {
            return null; // Hoặc trả về Collections.emptyList() nếu bạn muốn danh sách rỗng
        }

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            // Parse chuỗi JSON thành List<Map<String, List<String>>>
            return objectMapper.readValue(jsonString, new TypeReference<List<Map<String, List<String>>>>() {});
        } catch (JsonProcessingException e) {
            logger.error("Lỗi khi parse JSON cho services: {}", e.getMessage());
            throw new IllegalArgumentException("Định dạng JSON không hợp lệ cho services: " + e.getMessage());
        }
    }
    // Phương thức phụ để parse JSON map với value là Double
    private Map<String, Double> parseJsonMapDouble(String json) {
        if (json == null || json.trim().isEmpty()) return null;
        try {
            return objectMapper.readValue(json, objectMapper.getTypeFactory().constructMapType(Map.class, String.class, Double.class));
        } catch (Exception e) {
            logger.warn("Failed to parse JSON map with Double: {}", json, e);
            return null;
        }
    }
}