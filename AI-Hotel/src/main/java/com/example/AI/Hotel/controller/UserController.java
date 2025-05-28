package com.example.AI.Hotel.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.AI.Hotel.dto.*;
import com.example.AI.Hotel.model.*;
import com.example.AI.Hotel.repository.*;
import com.example.AI.Hotel.service.HotelDataService;
import com.example.AI.Hotel.service.TripService;
import com.example.AI.Hotel.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/user")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final TripService tripService;

    @Autowired
    private SearchHistoryRepository searchHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private HotelRepository hotelRepository;

    private final UserService userService;
    private final PlaceTripRepository placeTripRepository;
    private final HotelTripRepository hotelTripRepository;
    @Autowired
    private HotelDataService hotelDataService;

    @Autowired
    public UserController(TripService tripService,
                          UserService userService,
                          PlaceTripRepository placeTripRepository,
                          HotelTripRepository hotelTripRepository) {
        this.tripService = tripService;
        this.userService = userService;
        this.placeTripRepository = placeTripRepository;
        this.hotelTripRepository = hotelTripRepository;
    }


    @GetMapping("/search-history")
    public ResponseEntity<List<SearchHistoryDTO>> getSearchHistory() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        List<SearchHistory> history = searchHistoryRepository.findByUserId(user.getId());
        List<SearchHistoryDTO> historyDTOs = history.stream()
                .map(searchHistory -> new SearchHistoryDTO(
                        searchHistory.getId(),
                        searchHistory.getQueryHistory()
//                        searchHistory.getSearchDate()
                ))
                .toList();

        return ResponseEntity.ok(historyDTOs);
    }

    @PutMapping(value = "/profile", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestParam(value = "fullName", required = false) String fullName,
            @RequestParam(value = "phoneNumber", required = false) String phoneNumber,
            @RequestParam(value = "dateOfBirth", required = false) String dateOfBirth,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar) {
        Map<String, Object> response = new HashMap<>();
        Logger logger = LoggerFactory.getLogger(UserController.class);

        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            logger.info("Updating profile for email: {}", email);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalStateException("Người dùng không tìm thấy"));

            // Cập nhật thông tin hồ sơ
            if (fullName != null && !fullName.isEmpty()) {
                if (fullName.length() < 2 || fullName.length() > 100) {
                    response.put("message", "Họ và tên không đầy đủ ");
                    response.put("status", 400);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }
                user.setFullName(fullName);
                logger.info("Updated fullName to: {}", fullName);
            }
            if (phoneNumber != null && !phoneNumber.isEmpty()) {
                if (phoneNumber.length() < 10 || phoneNumber.length() > 15) {
                    response.put("message", "Số điện thoại không phù hợp ");
                    response.put("status", 400);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }
                user.setPhoneNumber(phoneNumber);
                logger.info("Updated phoneNumber to: {}", phoneNumber);
            }
            if (dateOfBirth != null && !dateOfBirth.isEmpty()) {
                try {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
                    LocalDate parsedDate = LocalDate.parse(dateOfBirth, formatter);
                    user.setDateOfBirth(parsedDate);
                    logger.info("Updated dateOfBirth to: {}", dateOfBirth);
                } catch (DateTimeParseException e) {
                    response.put("message", "Ngày tháng năm không phù hợp");
                    response.put("status", 400);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }
            }
            if (address != null && !address.isEmpty()) {
                if (address.length() > 255) {
                    response.put("message", "Địa chỉ chưa phù hợp ");
                    response.put("status", 400);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }
                user.setAddress(address);
                logger.info("Updated address to: {}", address);
            }

            // Xử lý file avatar nếu có
            if (avatar != null && !avatar.isEmpty()) {
                logger.info("Processing avatar upload for user: {}, file size: {}", email, avatar.getSize());
                // Kiểm tra định dạng file
                String contentType = avatar.getContentType();
                if (contentType == null || !(contentType.equals("image/jpeg") || contentType.equals("image/png") || contentType.equals("image/jpg"))) {
                    response.put("message", "Only image files (jpg, png, jpeg) are allowed");
                    response.put("status", 400);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }

                // Kiểm tra kích thước file
                if (avatar.getSize() > 10 * 1024 * 1024) { // Giới hạn 10MB
                    response.put("message", "File size must be less than 10MB");
                    response.put("status", 400);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }

                // Upload lên Cloudinary
                Map uploadResult = cloudinary.uploader().upload(avatar.getBytes(), ObjectUtils.asMap(
                        "resource_type", "image",
                        "public_id", email + "_" + System.currentTimeMillis()
                ));
                String newAvatarUrl = (String) uploadResult.get("secure_url");
                logger.info("Cloudinary upload result: {}", uploadResult);

                if (newAvatarUrl == null) {
                    throw new IOException("Failed to get secure_url from Cloudinary upload");
                }

                // Xóa avatar cũ trên Cloudinary nếu có (trừ avatar mặc định)
                if (user.getAvatarUrl() != null && !user.getAvatarUrl().contains("default-avatar")) {
                    String oldPublicId = extractPublicId(user.getAvatarUrl());
                    cloudinary.uploader().destroy(oldPublicId, ObjectUtils.emptyMap());
                    logger.info("Deleted old avatar with publicId: {}", oldPublicId);
                }

                // Cập nhật URL mới
                user.setAvatarUrl(newAvatarUrl);
                logger.info("Updated avatarUrl to: {}", newAvatarUrl);
            }

            userRepository.save(user);
            logger.info("User profile saved successfully for email: {}", email);

            response.put("message", "Người dùng đã cập nhật thông tin thành công");
            response.put("status", 200);
            response.put("avatarUrl", user.getAvatarUrl());
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            response.put("message", "Người dùng không tìm thấy");
            response.put("status", 404);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (IOException e) {
            logger.error("IOException during avatar upload: {}", e.getMessage());
            response.put("message", "Không thể cập nhật avatar " + e.getMessage());
            response.put("status", 500);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            logger.error("Unexpected error updating user: {}", e.getMessage(), e);
            response.put("message", "Không thể cập nhật người dùng: " + e.getMessage());
            response.put("status", 500);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/place-trip/add")
    public ResponseEntity<Map<String, Object>> addPlaceTrip(@Valid @RequestBody AddPlaceTripRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Lấy userId từ token
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            // Kiểm tra trùng lặp trước khi thêm
            if (placeTripRepository.findByUserIdAndPlaceId(user.getId(), request.getPlaceId()).isPresent()) {
                logger.warn("User {} attempted to add duplicate place {} to trip", user.getId(), request.getPlaceId());
                response.put("status", HttpStatus.BAD_REQUEST.value());
                response.put("message", "Place already added to trip");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            PlaceTrip placeTrip = tripService.addPlaceTrip(user.getId(), request.getPlaceId());

            response.put("status", HttpStatus.OK.value());
            response.put("message", "Place added to trip successfully");
            response.put("placeTrip", placeTrip);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Failed to add place to trip: {}", e.getMessage());
            response.put("status", HttpStatus.BAD_REQUEST.value());
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            logger.error("Error adding place to trip: {}", e.getMessage());
            response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.put("message", "Server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/place-trip/delete/{id}")
    public ResponseEntity<Map<String, Object>> deletePlaceTrip(@PathVariable Integer id) { // Thay Long bằng Integer
        Map<String, Object> response = new HashMap<>();

        try {
            // Lấy userId từ token
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            tripService.deletePlaceTrip(user.getId(), id);

            response.put("status", HttpStatus.OK.value());
            response.put("message", "Place removed from trip successfully");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Failed to delete place trip: {}", e.getMessage());
            response.put("status", HttpStatus.BAD_REQUEST.value());
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            logger.error("Error deleting place trip: {}", e.getMessage());
            response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.put("message", "Server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/hotel-trip/add")
    public ResponseEntity<Map<String, Object>> addHotelTrip(@Valid @RequestBody AddHotelTripRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Lấy userId từ token
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

            // Kiểm tra trùng lặp trước khi thêm
            if (hotelTripRepository.findByUserIdAndHotelId(user.getId(), request.getHotelId()).isPresent()) {
                logger.warn("User {} attempted to add duplicate hotel {} to trip", user.getId(), request.getHotelId());
                response.put("status", HttpStatus.BAD_REQUEST.value());
                response.put("message", "Khách sạn được thêm vào lịch trình thành công");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            HotelTrip hotelTrip = tripService.addHotelTrip(user.getId(), request.getHotelId());

            response.put("status", HttpStatus.OK.value());
            response.put("message", " Khách sạn được thêm vào lịch trình thành công ");
            response.put("hotelTrip", hotelTrip);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Failed to add hotel to trip: {}", e.getMessage());
            response.put("status", HttpStatus.BAD_REQUEST.value());
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            logger.error("Error adding hotel to trip: {}", e.getMessage());
            response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.put("message", "Server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/hotel-trip/delete/{id}")
    public ResponseEntity<Map<String, Object>> deleteHotelTrip(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Lấy userId từ token
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            tripService.deleteHotelTrip(user.getId(), id);

            response.put("status", HttpStatus.OK.value());
            response.put("message", "Hotel removed from trip successfully");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Failed to delete hotel trip: {}", e.getMessage());
            response.put("status", HttpStatus.BAD_REQUEST.value());
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            logger.error("Error deleting hotel trip: {}", e.getMessage());
            response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.put("message", "Server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // kiểm tra bằng cách gọi token
    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDTO userDTO = userService.getUserProfile(email);
        return ResponseEntity.ok(userDTO);
    }

    @PutMapping("/update-password")
    public ResponseEntity<Map<String, Object>> updatePassword(@Valid @RequestBody UpdatePasswordRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            userService.updatePassword(email, request.getOldPassword(), request.getNewPassword());

            response.put("status", HttpStatus.OK.value());
            response.put("message", "Password updated successfully");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Failed to update password for user: {}", e.getMessage());
            response.put("status", HttpStatus.BAD_REQUEST.value());
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (SecurityException e) {
            logger.warn("Unauthorized attempt to update password: {}", e.getMessage());
            response.put("status", HttpStatus.UNAUTHORIZED.value());
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);

        } catch (Exception e) {
            logger.error("Error updating password: {}", e.getMessage());
            response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.put("message", "Server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/hotel-trip-list")
    public ResponseEntity<Map<String, Object>> getHotelTrips() {
        Map<String, Object> response = new HashMap<>();

        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

            List<HotelSearchResponse> hotelTrips = hotelDataService.getHotelTripsByUser(user.getId());

            response.put("status", HttpStatus.OK.value());
            response.put("message", hotelTrips.isEmpty() ? "Không có khách sạn trong lịch trình" : "Lấy danh sách khách sạn thành công");
            response.put("data", hotelTrips);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to fetch hotel trips: {}", e.getMessage());
            response.put("status", HttpStatus.BAD_REQUEST.value());
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            logger.error("Error fetching hotel trips: {}", e.getMessage());
            response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.put("message", "Server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/place-trip-list")
    public ResponseEntity<Map<String, Object>> getPlaceTrips() {
        Map<String, Object> response = new HashMap<>();

        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

            List<PlaceDTO> placeTrips = hotelDataService.getPlaceTripsByUser(user.getId());

            response.put("status", HttpStatus.OK.value());
            response.put("message", placeTrips.isEmpty() ? "Không có địa điểm trong lịch trình" : "Lấy danh sách địa điểm thành công");
            response.put("data", placeTrips);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to fetch place trips: {}", e.getMessage());
            response.put("status", HttpStatus.BAD_REQUEST.value());
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            logger.error("Error fetching place trips: {}", e.getMessage());
            response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.put("message", "Server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/hotel-trip-list-paged")
    public ResponseEntity<Map<String, Object>> getHotelTripsPaged(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Map<String, Object> response = new HashMap<>();

        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

            Page<HotelSearchResponse> hotelTripsPage = hotelDataService.getHotelTripsByUser(user.getId(), page, size);

            response.put("hotels", hotelTripsPage.getContent());
            response.put("totalElements", hotelTripsPage.getTotalElements());
            response.put("totalPages", hotelTripsPage.getTotalPages());
            response.put("currentPage", hotelTripsPage.getNumber() + 1);
            response.put("message", hotelTripsPage.isEmpty() ? "Không có khách sạn trong lịch trình" : "Lấy danh sách khách sạn thành công");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to fetch hotel trips: {}", e.getMessage());
            response.put("status", HttpStatus.BAD_REQUEST.value());
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            logger.error("Error fetching hotel trips: {}", e.getMessage());
            response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.put("message", "Server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/wishlist")
    public ResponseEntity<PagedResponse<HotelDTO>> getWishlist(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Người dùng không tìm thấy"));

        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Wishlist> wishlistPage = wishlistRepository.findByUserId(user.getId(), pageable);

        List<HotelDTO> hotelDTOs = wishlistPage.getContent().stream()
                .map(w -> {
                    Hotel hotel = w.getHotel();
                    HotelDTO hotelDTO = new HotelDTO();
                    hotelDTO.setId(hotel.getId());
                    hotelDTO.setName(hotel.getName());
                    hotelDTO.setAddress(hotel.getAddress());
                    hotelDTO.setDistrict(hotel.getDistrict());
                    hotelDTO.setDescription(hotel.getDescription());
                    hotelDTO.setHotelLink(hotel.getHotelLink());
                    hotelDTO.setRatingStars(hotel.getRatingStars());
                    hotelDTO.setFacilities(hotel.getFacilities());
                    hotelDTO.setHighlights(hotel.getHighlights());
                    hotelDTO.setReviews(hotel.getReviews());
                    hotelDTO.setImageUrls(hotel.getImageUrls());
                    hotelDTO.setRoomServices(hotel.getRoomServices());
                    hotelDTO.setSlug(hotel.getSlug());
                    hotelDTO.setLatitude(hotel.getCoordinates() != null ? hotel.getCoordinates().getY() : null);
                    hotelDTO.setLongitude(hotel.getCoordinates() != null ? hotel.getCoordinates().getX() : null);
                    return hotelDTO;
                })
                .toList();

        PagedResponse<HotelDTO> response = new PagedResponse<>(
                hotelDTOs,
                page - 1, // Sử dụng page gốc (trừ 1 đã áp dụng ở trên)
                size,
                wishlistPage.getTotalElements(),
                wishlistPage.getTotalPages(),
                wishlistPage.isLast()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/wishlist/{hotelId}")
    public ResponseEntity<Map<String, Object>> addToWishlist(@PathVariable Integer hotelId) {
        Map<String, Object> response = new HashMap<>();

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new IllegalStateException("Hotel not found"));

        Optional<Wishlist> existingWishlist = wishlistRepository.findByUserIdAndHotelId(user.getId(), hotelId);
        if (existingWishlist.isPresent()) {
            response.put("message", "Hotel is already in your wishlist");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setHotel(hotel);
        wishlistRepository.save(wishlist);

        response.put("message", "Hotel added to wishlist successfully");
        response.put("status", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/wishlist/{hotelId}")
    public ResponseEntity<Map<String, Object>> removeFromWishlist(@PathVariable Integer hotelId) {
        Map<String, Object> response = new HashMap<>();

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        Optional<Wishlist> wishlist = wishlistRepository.findByUserIdAndHotelId(user.getId(), hotelId);
        if (wishlist.isEmpty()) {
            response.put("message", "Hotel not found in your wishlist");
            response.put("status", HttpStatus.NOT_FOUND.value());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        wishlistRepository.delete(wishlist.get());

        response.put("message", "Hotel removed from wishlist successfully");
        response.put("status", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/get-facilities-by-hotel")
    public ResponseEntity<PagedResponse<HotelSearchResponse>> getFacility(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(value = "facilities", required = false) String facilitiesParam) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalStateException("Không tìm thấy người dùng"));
        } catch (IllegalStateException e) {
            throw new RuntimeException(e);
        }
        Page<HotelSearchResponse> hotelPage = hotelDataService.getAllHotels(page, size);
        Pageable pageable = PageRequest.of(page - 1, size);

        // Chuyển đổi facilitiesParam thành List<String>
        List<String> filterFacilities = (facilitiesParam != null && !facilitiesParam.trim().isEmpty())
                ? Arrays.asList(facilitiesParam.split(","))
                : null;
        if (filterFacilities != null && !filterFacilities.isEmpty()) {
            hotelPage = new PageImpl<>(
                    hotelPage.getContent().stream()
                            .filter(dto -> dto.getHotel().getFacilities() != null && dto.getHotel().getFacilities().containsAll(filterFacilities))
                            .collect(Collectors.toList()),
                    pageable, hotelPage.getTotalElements()
            );
        }
        Map<String, Object> response = new HashMap<>();
//        response.put("message", "Tìm thấy " + hotelPage.getTotalElements() + " khách sạn");
        response.put("hotels", hotelPage.getContent());
        response.put("currentPage", page);
        response.put("pageSize", size);
        response.put("totalItems", hotelPage.getTotalElements());
        response.put("totalPages", hotelPage.getTotalPages());
        response.put("status", HttpStatus.OK.value());
        return ResponseEntity.ok((PagedResponse<HotelSearchResponse>) response);

    }

    private String extractPublicId(String url) {
        String[] parts = url.split("/");
        String fileName = parts[parts.length - 1];
        return fileName.substring(0, fileName.lastIndexOf("."));
    }
}

