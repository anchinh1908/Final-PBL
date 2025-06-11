package com.example.AI.Hotel.service;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.AI.Hotel.common.DuplicateSlugException;
import com.example.AI.Hotel.dto.EmbeddingRequest;
import com.example.AI.Hotel.dto.HotelDTO;
import com.example.AI.Hotel.dto.PlaceDTO;
import com.example.AI.Hotel.dto.RoomDTO;
import com.example.AI.Hotel.model.*;
import com.example.AI.Hotel.repository.*;
//import com.fasterxml.jackson.databind.ObjectMapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.postgresql.util.PGobject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);

    @PersistenceContext
    private EntityManager entityManager;

    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final PlaceRepository placeRepository;
    private final Cloudinary cloudinary;
    private final RestTemplate restTemplate;
    private final TransactionTemplate transactionTemplate;
    private final JdbcTemplate jdbcTemplate;
//    private static final String EMBEDDING_HOTEL_VECTOR = "https://anchinh-embeddingapi.hf.space/embedHotel";
//    private static final String EMBEDDING_ROOM_VECTOR = "https://anchinh-embeddingapi.hf.space/embedRoom";
//    private static final String EMBEDDING_PLACE_VECTOR = "https://anchinh-embeddingapi.hf.space/embedPlace";
    private static final String SAVE_HOTEL ="https://final-pbl-flaskapi.onrender.com/saveHotel";
    private static final String UPDATE_HOTEL ="https://final-pbl-flaskapi.onrender.com/updateHotel";
    private static final String SAVE_PLACE ="https://final-pbl-flaskapi.onrender.com/savePlace";
    private static final String UPDATE_PLACE ="https://final-pbl-flaskapi.onrender.com/updatePlace";
    private static final String SAVE_ROOM ="https://final-pbl-flaskapi.onrender.com/saveRoom";
    private static final String UPDATE_ROOM ="https://final-pbl-flaskapi.onrender.com/updateRoom";
    private final HotelEmbeddingRepository hotelEmbeddingRepository;


    @Autowired
    public AdminService(UserRepository userRepository, HotelRepository hotelRepository, Cloudinary cloudinary, RoomRepository roomRepository, PlaceRepository placeRepository, TransactionTemplate transactionTemplate, JdbcTemplate jdbcTemplate, HotelEmbeddingRepository hotelEmbeddingRepository) {
        this.userRepository = userRepository;
        this.hotelRepository = hotelRepository;
        this.cloudinary = cloudinary;
        this.roomRepository = roomRepository;
        this.placeRepository = placeRepository;
        this.transactionTemplate = transactionTemplate;
        this.jdbcTemplate = jdbcTemplate;
        this.restTemplate = new RestTemplate();
        this.hotelEmbeddingRepository = hotelEmbeddingRepository;
    }

    @Transactional
    public void disableUser(Integer userId) {
        // Lấy thông tin user hiện tại từ SecurityContext
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy Admin"));

        // Kiểm tra quyền admin từ authorities
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            logger.warn("User {} attempted to disable a user but lacks ADMIN role", adminEmail);
            throw new SecurityException("Only admins can disable user accounts");
        }

        // Kiểm tra user tồn tại
        if (!userRepository.existsByIdAndNotDeleted(userId)) {
            logger.warn("User with ID {} not found or already deleted", userId);
            throw new IllegalArgumentException("User with ID " + userId + " not found or already deleted");
        }

        // Vô hiệu hóa tài khoản
        userRepository.softDeleteById(userId);
        logger.info("Admin {} disabled user with ID {}", adminEmail, userId);
    }

    @Transactional
    public void restoreUser(Integer userId) {
        // Lấy thông tin user hiện tại từ SecurityContext
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy Admin"));

        // Kiểm tra quyền admin từ authorities
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            logger.warn("User {} attempted to restore a user but lacks ADMIN role", adminEmail);
            throw new SecurityException("Only admins can restore user accounts");
        }

        // Kiểm tra user tồn tại
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User with ID " + userId + " not found"));

        if (!user.isDeleted()) {
            logger.warn("User with ID {} is not deleted, no need to restore", userId);
            throw new IllegalStateException("User with ID " + userId + " is not deleted");
        }

        // Khôi phục tài khoản
        userRepository.restoreById(userId);
        logger.info("Admin {} restored user with ID {}", adminEmail, userId);
    }

    public Map<String, Object> addHotel(HotelDTO hotelDTO, MultipartFile[] images) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy Admin"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            logger.warn("User {} attempted to add a hotel but lacks ADMIN role", adminEmail);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Chỉ có admin mới thêm được khách sạn");
            response.put("status", HttpStatus.FORBIDDEN.value());
            return response;
        }

        // Kiểm tra các trường bắt buộc
        if (hotelDTO.getName() == null || hotelDTO.getName().trim().isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Hotel name is required");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return response;
        }
        if (hotelDTO.getAddress() == null || hotelDTO.getAddress().trim().isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Hotel address is required");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return response;
        }
        if (hotelDTO.getDistrict() == null || hotelDTO.getDistrict().trim().isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Hotel district is required");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return response;
        }

        // Kiểm tra slug đã tồn tại
        String slug = hotelDTO.getSlug();
        if (slug != null && !slug.trim().isEmpty() && hotelRepository.existsBySlug(slug)) {
            logger.error("Slug conflict detected - Slug: {} already exists", slug);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Slug '" + slug + "' đã tồn tại");
            errorResponse.put("status", HttpStatus.CONFLICT.value());
            return errorResponse;
        }

        // Xử lý upload hình ảnh
        List<String> uploadedImageUrls = new ArrayList<>();
        if (images != null && images.length > 0) {
            logger.info("Received {} image files", images.length);
            for (MultipartFile image : images) {
                try {
                    if (image == null || image.isEmpty()) {
                        logger.warn("Skipping empty file: {}", image != null ? image.getOriginalFilename() : "null");
                        continue;
                    }
                    String contentType = image.getContentType();
                    if (contentType == null || !contentType.matches("image/(jpeg|png|jpg)")) {
                        logger.warn("Unsupported file format for file: {}. Expected JPEG, PNG, or JPG.", image.getOriginalFilename());
                        continue;
                    }
                    byte[] fileBytes = image.getBytes();
                    if (fileBytes.length == 0) {
                        logger.warn("File is empty after reading: {}", image.getOriginalFilename());
                        continue;
                    }
                    String originalFilename = image.getOriginalFilename();
                    String publicId = originalFilename != null ?
                            originalFilename.replaceAll("[^a-zA-Z0-9-_]", "_") : UUID.randomUUID().toString();
                    Map uploadResult = cloudinary.uploader().upload(fileBytes, ObjectUtils.asMap(
                            "folder", "hotels/" + (hotelDTO.getSlug() != null ? hotelDTO.getSlug() : "default"),
                            "resource_type", "image",
                            "public_id", publicId
                    ));
                    String uploadedUrl = (String) uploadResult.get("secure_url");
                    uploadedImageUrls.add(uploadedUrl);
                    logger.info("Uploaded image to Cloudinary: {}", uploadedUrl);
                } catch (Exception e) {
                    logger.error("Error uploading image to Cloudinary: {}", image != null ? image.getOriginalFilename() : "null", e);
                }
            }
        }
        logger.info("image -> " + uploadedImageUrls);
        hotelDTO.setImageUrls(uploadedImageUrls.isEmpty() ? null : uploadedImageUrls);

        // Gửi dữ liệu tới Python
        List<HotelDTO> hotelData = new ArrayList<>();
        hotelData.add(hotelDTO);
        EmbeddingRequest requestBody = new EmbeddingRequest(hotelData, "hotel");

        // Log dữ liệu gửi đi
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            String jsonRequest = objectMapper.writeValueAsString(requestBody);
            logger.info("Sending request to Python: {}", jsonRequest);
        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize request: {}", e.getMessage());
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<EmbeddingRequest> requestEntity = new HttpEntity<>(requestBody, headers);
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
//                    "http://127.0.0.1:8001/saveHotel",
                    SAVE_HOTEL,
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("hotel_id")) {
                Map<String, Object> successResponse = new HashMap<>();
                successResponse.put("message", "Khách sạn với ID " + responseBody.get("hotel_id") + " đã được thêm thành công");
                successResponse.put("status", HttpStatus.CREATED.value());
                successResponse.put("hotel_id", ((Number) responseBody.get("hotel_id")).intValue());
                return successResponse;
            }
            throw new RuntimeException("Không nhận được hotel_id từ Python service");
        } catch (Exception e) {
            logger.error("Error calling Python service: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Không thể lưu khách sạn và tạo embedding");
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return errorResponse;
        }
    }

    public Map<String, Object> updateHotel(Integer hotelId, HotelDTO hotelDTO, String images) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy Admin"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            logger.warn("User {} attempted to update a hotel but lacks ADMIN role", adminEmail);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Chỉ có admin mới cập nhật được khách sạn");
            response.put("status", HttpStatus.FORBIDDEN.value());
            return response;
        }

        // Kiểm tra hotel tồn tại
        Hotel existingHotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new IllegalStateException("Khách sạn với ID " + hotelId + " không tồn tại"));

        // Kiểm tra các trường bắt buộc
        if (hotelDTO.getName() == null || hotelDTO.getName().trim().isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Hotel name is required");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return response;
        }
        if (hotelDTO.getAddress() == null || hotelDTO.getAddress().trim().isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Hotel address is required");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return response;
        }
        if (hotelDTO.getDistrict() == null || hotelDTO.getDistrict().trim().isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Hotel district is required");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return response;
        }

        // Không cho phép cập nhật slug, giữ nguyên giá trị cũ
        String originalSlug = existingHotel.getSlug();
        if (originalSlug == null || originalSlug.trim().isEmpty()) {
            logger.warn("Original slug is empty or null for hotel ID {}", hotelId);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Không thể cập nhật khách sạn vì slug gốc không tồn tại");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return response;
        }
        hotelDTO.setSlug(originalSlug); // Gán lại slug cũ, bỏ qua giá trị mới từ hotelDTO

        // Xử lý images từ chuỗi
        List<String> imageUrls = new ArrayList<>();
        if (images != null && !images.trim().isEmpty()) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                imageUrls = objectMapper.readValue(images, new TypeReference<List<String>>() {});
                logger.info("Parsed image URLs from JSON: {}", imageUrls);
            } catch (JsonProcessingException e) {
                String[] urlArray = images.split(",");
                for (String url : urlArray) {
                    String trimmedUrl = url.trim();
                    if (!trimmedUrl.isEmpty()) {
                        imageUrls.add(trimmedUrl);
                    }
                }
                logger.info("Parsed image URLs from comma-separated string: {}", imageUrls);
            }
        } else if (existingHotel.getImageUrls() != null) {
            // Giữ nguyên imageUrls cũ nếu không có ảnh mới
            imageUrls.addAll(existingHotel.getImageUrls());
            logger.info("Using existing image URLs: {}", imageUrls);
        } else {
            logger.warn("No image URLs provided, and no existing images found");
        }
        hotelDTO.setImageUrls(imageUrls.isEmpty() ? null : imageUrls);

        // Gửi dữ liệu tới Python
        List<HotelDTO> hotelData = new ArrayList<>();
        hotelDTO.setId(hotelId); // Thêm id để Python biết hotel cần cập nhật
        hotelData.add(hotelDTO);
        EmbeddingRequest requestBody = new EmbeddingRequest(hotelData, "hotel");

        // Log dữ liệu gửi đi
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            String jsonRequest = objectMapper.writeValueAsString(requestBody);
            logger.info("Sending update request to Python: {}", jsonRequest);
        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize update request: {}", e.getMessage());
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<EmbeddingRequest> requestEntity = new HttpEntity<>(requestBody, headers);
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
//                    "http://127.0.0.1:8001/updateHotel",
                    UPDATE_HOTEL,
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("hotel_id")) {
                Map<String, Object> successResponse = new HashMap<>();
                successResponse.put("message", "Khách sạn với ID " + responseBody.get("hotel_id") + " đã được cập nhật thành công");
                successResponse.put("status", HttpStatus.OK.value());
                successResponse.put("hotel_id", ((Number) responseBody.get("hotel_id")).intValue());
                return successResponse;
            }
            throw new RuntimeException("Không nhận được hotel_id từ Python service");
        } catch (Exception e) {
            logger.error("Error calling Python service for update: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Không thể cập nhật khách sạn và tạo embedding");
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return errorResponse;
        }
    }

    public void deleteHotel(Integer hotelId) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalStateException("Admin not found"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            logger.warn("User {} attempted to delete a hotel but lacks ADMIN role", adminEmail);
            throw new SecurityException("Only admins can delete hotels");
        }

        Hotel existingHotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new IllegalStateException("Hotel with ID " + hotelId + " not found"));

        transactionTemplate.execute(status -> {
            try {
                hotelRepository.delete(existingHotel);
//                hotelRepository.flush();
                logger.info("Hotel with ID {} has been deleted successfully", hotelId);
                return null;
            } catch (Exception e) {
                logger.error("Failed to delete hotel with ID {}: {}", hotelId, e.getMessage());
                throw new RuntimeException("Failed to delete hotel: " + e.getMessage());
            }
        });
    }

    /*
    @Transactional
    public void deleteHotels(List<Integer> hotelIds) {
        // Kiểm tra quyền admin
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalStateException("Admin not found"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            logger.warn("User {} attempted to delete hotels but lacks ADMIN role", adminEmail);
            throw new SecurityException("Only admins can delete hotels");
        }

        // Kiểm tra danh sách hotelIds
        if (hotelIds == null || hotelIds.isEmpty()) {
            throw new IllegalArgumentException("Danh sách ID khách sạn không được rỗng");
        }

        // Tìm tất cả khách sạn theo danh sách ID
        List<Hotel> hotelsToDelete = hotelRepository.findAllById(hotelIds);
        if (hotelsToDelete.size() != hotelIds.size()) {
            // Nếu không tìm thấy một số khách sạn
            List<Integer> foundIds = hotelsToDelete.stream()
                    .map(Hotel::getId)
                    .toList();
            List<Integer> notFoundIds = hotelIds.stream()
                    .filter(id -> !foundIds.contains(id))
                    .toList();
            throw new IllegalStateException("Không tìm thấy khách sạn với các ID: " + notFoundIds);
        }

        // Lấy tất cả room liên quan
        List<Integer> hotelIdsList = hotelsToDelete.stream().map(Hotel::getId).toList();
        List<RoomType> roomsToDelete = roomRepository.findByHotelIdIn(hotelIdsList);
        if (!roomsToDelete.isEmpty()) {
            roomRepository.deleteAll(roomsToDelete);
            roomRepository.flush();
        }

        // Xóa tất cả khách sạn trong một giao dịch
        transactionTemplate.execute(status -> {
            try {
                hotelRepository.deleteAll(hotelsToDelete);
                hotelRepository.flush();
                logger.info("Hotels with IDs {} have been deleted successfully", hotelIds);
                return null;
            } catch (Exception e) {
                logger.error("Failed to delete hotels with IDs {}: {}", hotelIds, e.getMessage());
                throw new RuntimeException("Failed to delete hotels: " + e.getMessage());
            }
        });
    }

     */
    @Transactional
    public void deleteHotels(List<Integer> hotelIds) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalStateException("Admin not found"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            logger.warn("User {} attempted to delete hotels but lacks ADMIN role", adminEmail);
            throw new SecurityException("Only admins can delete hotels");
        }

        if (hotelIds == null || hotelIds.isEmpty()) {
            throw new IllegalArgumentException("Danh sách ID khách sạn không được rỗng");
        }

        List<Hotel> hotelsToDelete = hotelRepository.findAllById(hotelIds)
                .stream()
                .filter(hotel -> hotel != null) // Loại bỏ null nếu có
                .collect(Collectors.toList());

        if (hotelsToDelete.size() != hotelIds.size()) {
            List<Integer> foundIds = hotelsToDelete.stream().map(Hotel::getId).toList();
            List<Integer> notFoundIds = hotelIds.stream().filter(id -> !foundIds.contains(id)).toList();
            throw new IllegalStateException("Không tìm thấy khách sạn với các ID: " + notFoundIds);
        }

        List<Integer> hotelIdsList = hotelsToDelete.stream().map(Hotel::getId).toList();
        List<RoomType> roomsToDelete = roomRepository.findByHotelIdIn(hotelIdsList);
        if (!roomsToDelete.isEmpty()) {
            roomRepository.deleteAll(roomsToDelete);
            roomRepository.flush();
            logger.debug("Deleted {} rooms related to hotels {}", roomsToDelete.size(), hotelIds);
        }

        transactionTemplate.execute(status -> {
            try {
                logger.debug("Attempting to delete hotels with IDs: {}", hotelIds);
                hotelRepository.deleteByIdIn(hotelIds);
                hotelRepository.flush();
                logger.info("Hotels with IDs {} have been deleted successfully", hotelIds);
                return null;
            } catch (Exception e) {
                logger.error("Failed to delete hotels with IDs {}: {}", hotelIds, e.getMessage(), e);
                status.setRollbackOnly();
                throw new RuntimeException("Failed to delete hotels: " + e.getMessage(), e);
            }
        });
    }

    @Transactional
    public void deletePlaces(List<Integer> placeIds) {
        // Kiểm tra quyền admin
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalStateException("Admin not found"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            logger.warn("User {} attempted to delete hotels but lacks ADMIN role", adminEmail);
            throw new SecurityException("Only admins can delete hotels");
        }

        // Kiểm tra danh sách hotelIds
        if (placeIds == null || placeIds.isEmpty()) {
            throw new IllegalArgumentException("Danh sách địa điểm đang bị rỗng");
        }

        // Tìm tất cả khách sạn theo danh sách ID
        List<Place> placesToDelete = placeRepository.findAllById(placeIds);
        if (placesToDelete.size() != placeIds.size()) {
            // Nếu không tìm thấy một số khách sạn
            List<Integer> foundIds = placesToDelete.stream()
                    .map(Place::getId)
                    .toList();
            List<Integer> notFoundIds = placeIds.stream()
                    .filter(id -> !foundIds.contains(id))
                    .toList();
            throw new IllegalStateException("Không tìm thấy khách sạn với các ID: " + notFoundIds);
        }

        // Xóa tất cả khách sạn trong một giao dịch
        transactionTemplate.execute(status -> {
            try {
                placeRepository.deleteAll(placesToDelete);
                placeRepository.flush();
                logger.info("Places with IDs {} have been deleted successfully", placeIds);
                return null;
            } catch (Exception e) {
                logger.error("Failed to delete hotels with IDs {}: {}", placeIds, e.getMessage());
                throw new RuntimeException("Failed to delete places: " + e.getMessage());
            }
        });
    }

    @Transactional
    public void deleteRooms(List<Integer> roomIds) {
        // Kiểm tra quyền admin
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalStateException("Admin not found"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            logger.warn("User {} attempted to delete hotels but lacks ADMIN role", adminEmail);
            throw new SecurityException("Only admins can delete hotels");
        }

        // Kiểm tra danh sách hotelIds
        if (roomIds == null || roomIds.isEmpty()) {
            throw new IllegalArgumentException("Danh sách địa điểm đang bị rỗng");
        }

        // Tìm tất cả khách sạn theo danh sách ID
        List<RoomType> roomsToDelete = roomRepository.findAllById(roomIds);
        if (roomsToDelete.size() != roomIds.size()) {
            // Nếu không tìm thấy một số khách sạn
            List<Integer> foundIds = roomsToDelete.stream()
                    .map(RoomType::getId)
                    .toList();
            List<Integer> notFoundIds = roomIds.stream()
                    .filter(id -> !foundIds.contains(id))
                    .toList();
            throw new IllegalStateException("Không tìm thấy khách sạn với các ID: " + notFoundIds);
        }

        // Xóa tất cả khách sạn trong một giao dịch
        transactionTemplate.execute(status -> {
            try {
                roomRepository.deleteAll(roomsToDelete);
                roomRepository.flush(); //flush() ép các thay đổi trong Persistence Context được áp dụng ngay lập tức xuống database, mà không cần đợi đến khi giao dịch commit.
                logger.info("Rooms with IDs {} have been deleted successfully", roomIds);
                return null;
            } catch (Exception e) {
                logger.error("Failed to delete hotels with IDs {}: {}", roomIds, e.getMessage());
                throw new RuntimeException("Failed to delete places: " + e.getMessage());
            }
        });
    }

    public Map<String, Object> addRoom(RoomDTO roomDTO) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy Admin"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            logger.warn("User {} attempted to add a room but lacks ADMIN role", adminEmail);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Chỉ có admin mới thêm được phòng");
            response.put("status", HttpStatus.FORBIDDEN.value());
            return response;
        }

        // Kiểm tra các trường bắt buộc
        if (roomDTO.getHotelId() == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Hotel ID is required");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return response;
        }
        if (roomDTO.getName() == null || roomDTO.getName().trim().isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Room name is required");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return response;
        }
        if (roomDTO.getNumberOfGuests() == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Number of guests is required");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return response;
        }
        if (roomDTO.getPrice() == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Price is required");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return response;
        }

        // Gửi dữ liệu tới Python
        List<RoomDTO> roomData = new ArrayList<>();
        roomData.add(roomDTO);
        EmbeddingRequest requestBody = new EmbeddingRequest(roomData, "room");

        // Log dữ liệu gửi đi
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            String jsonRequest = objectMapper.writeValueAsString(requestBody);
            logger.info("Sending request to Python: {}", jsonRequest);
        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize request: {}", e.getMessage());
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<EmbeddingRequest> requestEntity = new HttpEntity<>(requestBody, headers);
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
//                    "http://127.0.0.1:8001/saveRoom",
                    SAVE_ROOM,
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("room_id")) {
                Map<String, Object> successResponse = new HashMap<>();
                successResponse.put("message", "Phòng với ID " + responseBody.get("room_id") + " đã được thêm thành công");
                successResponse.put("status", HttpStatus.CREATED.value());
                successResponse.put("room_id", ((Number) responseBody.get("room_id")).intValue());
                return successResponse;
            }
            throw new RuntimeException("Không nhận được room_id từ Python service");
        } catch (Exception e) {
            logger.error("Error calling Python service: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Không thể lưu phòng và tạo embedding");
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return errorResponse;
        }
    }

    public Map<String, Object> updateRoom(Integer roomId, RoomDTO roomDTO) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy Admin"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            logger.warn("User {} attempted to update a room but lacks ADMIN role", adminEmail);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Chỉ có admin mới cập nhật được phòng");
            response.put("status", HttpStatus.FORBIDDEN.value());
            return response;
        }

        // Kiểm tra room tồn tại
        RoomType existingRoom = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalStateException("Phòng với ID " + roomId + " không tồn tại"));

        // Kiểm tra các trường bắt buộc
        if (roomDTO.getName() == null || roomDTO.getName().trim().isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Room name is required");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return response;
        }
        if (roomDTO.getNumberOfGuests() == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Number of guests is required");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return response;
        }
        if (roomDTO.getPrice() == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Price is required");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return response;
        }

        // Gửi dữ liệu tới Python
        List<RoomDTO> roomData = new ArrayList<>();
        roomDTO.setId(roomId); // Thêm id để Python biết room cần cập nhật
//        roomDTO.
        roomData.add(roomDTO);
        EmbeddingRequest requestBody = new EmbeddingRequest(roomData, "room");

        // Log dữ liệu gửi đi
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            String jsonRequest = objectMapper.writeValueAsString(requestBody);
            logger.info("Sending update request to Python: {}", jsonRequest);
        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize update request: {}", e.getMessage());
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<EmbeddingRequest> requestEntity = new HttpEntity<>(requestBody, headers);
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
//                    "http://127.0.0.1:8001/updateRoom",
                    UPDATE_ROOM,
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("room_id")) {
                Map<String, Object> successResponse = new HashMap<>();
                successResponse.put("message", "Phòng với ID " + responseBody.get("room_id") + " đã được cập nhật thành công");
                successResponse.put("status", HttpStatus.OK.value());
                successResponse.put("room_id", ((Number) responseBody.get("room_id")).intValue());
                return successResponse;
            }
            throw new RuntimeException("Không nhận được room_id từ Python service");
        } catch (Exception e) {
            logger.error("Error calling Python service for update: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Không thể cập nhật phòng và tạo embedding");
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return errorResponse;
        }
    }

    public void deleteRoom(Integer roomId) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalStateException("Admin not found"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            logger.warn("User {} attempted to delete a room but lacks ADMIN role", adminEmail);
            throw new SecurityException("Only admins can delete rooms");
        }

        RoomType existingRoom = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalStateException("Room with ID " + roomId + " not found"));

        transactionTemplate.execute(status -> {
            try {
                roomRepository.delete(existingRoom);
                roomRepository.flush();
                logger.info("Room with ID {} has been deleted successfully", roomId);
                // Không cần gọi API /embedRoom vì ON DELETE CASCADE sẽ tự động xóa bản ghi trong room_embeddings
                return null;
            } catch (Exception e) {
                logger.error("Failed to delete room with ID {}: {}", roomId, e.getMessage());
                throw new RuntimeException("Failed to delete room: " + e.getMessage());
            }
        });
    }


    public Map<String, Object> addPlace(PlaceDTO placeDTO, MultipartFile[] images) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy Admin"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            logger.warn("User {} attempted to add a place but lacks ADMIN role", adminEmail);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Chỉ có admin mới thêm được địa điểm");
            response.put("status", HttpStatus.FORBIDDEN.value());
            return response;
        }

        // Kiểm tra các trường bắt buộc
        if (placeDTO.getTitle() == null || placeDTO.getTitle().trim().isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Place title is required");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return response;
        }
        if (placeDTO.getAddress() == null || placeDTO.getAddress().trim().isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Place address is required");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return response;
        }

        // Kiểm tra slug đã tồn tại
        String slug = placeDTO.getSlug();
        if (slug != null && !slug.trim().isEmpty() && placeRepository.existsBySlug(slug)) {
            logger.error("Slug conflict detected - Slug: {} already exists", slug);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Slug '" + slug + "' đã tồn tại");
            errorResponse.put("status", HttpStatus.CONFLICT.value());
            return errorResponse;
        }

        // Xử lý upload hình ảnh
        List<String> uploadedImageUrls = new ArrayList<>();
        if (images != null && images.length > 0) {
            logger.info("Received {} image files", images.length);
            for (MultipartFile image : images) {
                try {
                    if (image == null || image.isEmpty()) {
                        logger.warn("Skipping empty file: {}", image != null ? image.getOriginalFilename() : "null");
                        continue;
                    }
                    String contentType = image.getContentType();
                    if (contentType == null || !contentType.matches("image/(jpeg|png|jpg)")) {
                        logger.warn("Unsupported file format for file: {}. Expected JPEG, PNG, or JPG.", image.getOriginalFilename());
                        continue;
                    }
                    byte[] fileBytes = image.getBytes();
                    if (fileBytes.length == 0) {
                        logger.warn("File is empty after reading: {}", image.getOriginalFilename());
                        continue;
                    }
                    String originalFilename = image.getOriginalFilename();
                    String publicId = originalFilename != null ?
                            originalFilename.replaceAll("[^a-zA-Z0-9-_]", "_") : UUID.randomUUID().toString();
                    Map uploadResult = cloudinary.uploader().upload(fileBytes, ObjectUtils.asMap(
                            "folder", "places/" + (placeDTO.getSlug() != null ? placeDTO.getSlug() : "default"),
                            "resource_type", "image",
                            "public_id", publicId
                    ));
                    String uploadedUrl = (String) uploadResult.get("secure_url");
                    uploadedImageUrls.add(uploadedUrl);
                    logger.info("Uploaded image to Cloudinary: {}", uploadedUrl);
                } catch (Exception e) {
                    logger.error("Error uploading image to Cloudinary: {}", image != null ? image.getOriginalFilename() : "null", e);
                }
            }
        }
        placeDTO.setImageUrl(uploadedImageUrls.isEmpty() ? null : uploadedImageUrls.get(0)); // Chỉ lấy URL đầu tiên cho imageUrl

        // Gửi dữ liệu tới Python
        List<PlaceDTO> placeData = new ArrayList<>();
        placeData.add(placeDTO);
        EmbeddingRequest requestBody = new EmbeddingRequest(placeData, "place");

        // Log dữ liệu gửi đi
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            String jsonRequest = objectMapper.writeValueAsString(requestBody);
            logger.info("Sending request to Python: {}", jsonRequest);
        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize request: {}", e.getMessage());
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<EmbeddingRequest> requestEntity = new HttpEntity<>(requestBody, headers);
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
//                    "http://127.0.0.1:8001/savePlace",
                    SAVE_PLACE,
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("place_id")) {
                Map<String, Object> successResponse = new HashMap<>();
                successResponse.put("message", "Địa điểm với ID " + responseBody.get("place_id") + " đã được thêm thành công");
                successResponse.put("status", HttpStatus.CREATED.value());
                successResponse.put("place_id", ((Number) responseBody.get("place_id")).intValue());
                return successResponse;
            }
            throw new RuntimeException("Không nhận được place_id từ Python service");
        } catch (Exception e) {
            logger.error("Error calling Python service: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Không thể lưu địa điểm và tạo embedding");
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return errorResponse;
        }
    }

    public Map<String, Object> updatePlace(Integer placeId, PlaceDTO placeDTO, String images) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy Admin"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            logger.warn("User {} attempted to update a place but lacks ADMIN role", adminEmail);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Chỉ có admin mới cập nhật được địa điểm");
            response.put("status", HttpStatus.FORBIDDEN.value());
            return response;
        }

        // Kiểm tra place tồn tại
        Place existingPlace = placeRepository.findById(placeId)
                .orElseThrow(() -> new IllegalStateException("Địa điểm với ID " + placeId + " không tồn tại"));

        // Kiểm tra các trường bắt buộc
        if (placeDTO.getTitle() == null || placeDTO.getTitle().trim().isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Place title is required");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return response;
        }
        if (placeDTO.getAddress() == null || placeDTO.getAddress().trim().isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Place address is required");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return response;
        }

        // Không cho phép cập nhật slug, giữ nguyên giá trị cũ
        String originalSlug = existingPlace.getSlug();
        if (originalSlug == null || originalSlug.trim().isEmpty()) {
            logger.warn("Original slug is empty or null for place ID {}", placeId);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Không thể cập nhật địa điểm vì slug gốc không tồn tại");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return response;
        }
        placeDTO.setSlug(originalSlug); // Gán lại slug cũ, bỏ qua giá trị mới từ placeDTO

        // Xử lý images từ chuỗi
        List<String> imageUrls = new ArrayList<>();
        if (images != null && !images.trim().isEmpty()) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                imageUrls = objectMapper.readValue(images, new TypeReference<List<String>>() {});
                logger.info("Parsed image URLs from JSON: {}", imageUrls);
            } catch (JsonProcessingException e) {
                String[] urlArray = images.split(",");
                for (String url : urlArray) {
                    String trimmedUrl = url.trim();
                    if (!trimmedUrl.isEmpty()) {
                        imageUrls.add(trimmedUrl);
                    }
                }
                logger.info("Parsed image URLs from comma-separated string: {}", imageUrls);
            }
        } else if (existingPlace.getImageUrl() != null) {
            // Giữ nguyên imageUrl cũ nếu không có ảnh mới
            imageUrls.add(existingPlace.getImageUrl());
            logger.info("Using existing image URL: {}", imageUrls);
        } else {
            logger.warn("No image URLs provided, and no existing image found");
        }
        placeDTO.setImageUrl(imageUrls.isEmpty() ? null : imageUrls.get(0)); // Chỉ lấy URL đầu tiên cho imageUrl

        // Xử lý images thành String
//        String imageUrl = null;
//        if (images != null && !images.trim().isEmpty()) {
//            // Lấy URL đầu tiên nếu chuỗi chứa nhiều URL (tách bằng dấu phẩy)
//            String trimmedImages = images.trim();
//            imageUrl = trimmedImages.contains(",") ? trimmedImages.split(",")[0].trim() : trimmedImages;
//            logger.info("Parsed image URL from string: {}", imageUrl);
//        } else if (existingPlace.getImageUrl() != null) {
//            // Giữ nguyên imageUrl cũ nếu không có ảnh mới
//            imageUrl = existingPlace.getImageUrl();
//            logger.info("Using existing image URL: {}", imageUrl);
//        } else {
//            logger.warn("No image URL provided, and no existing image found");
//        }
//        placeDTO.setImageUrl(imageUrl); // Gán trực tiếp String cho imageUrl

        // Gửi dữ liệu tới Python
        List<PlaceDTO> placeData = new ArrayList<>();
        placeDTO.setId(placeId); // Thêm id để Python biết place cần cập nhật
        placeData.add(placeDTO);
        EmbeddingRequest requestBody = new EmbeddingRequest(placeData, "place");

        // Log dữ liệu gửi đi
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            String jsonRequest = objectMapper.writeValueAsString(requestBody);
            logger.info("Sending update request to Python: {}", jsonRequest);
        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize update request: {}", e.getMessage());
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<EmbeddingRequest> requestEntity = new HttpEntity<>(requestBody, headers);
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
//                    "http://127.0.0.1:8001/updatePlace",
                    UPDATE_PLACE,
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("place_id")) {
                Map<String, Object> successResponse = new HashMap<>();
                successResponse.put("message", "Địa điểm với ID " + responseBody.get("place_id") + " đã được cập nhật thành công");
                successResponse.put("status", HttpStatus.OK.value());
                successResponse.put("place_id", ((Number) responseBody.get("place_id")).intValue());
                return successResponse;
            }
            throw new RuntimeException("Không nhận được place_id từ Python service");
        } catch (Exception e) {
            logger.error("Error calling Python service for update: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Không thể cập nhật địa điểm và tạo embedding");
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return errorResponse;
        }
    }

    public void deletePlace(Integer placeId) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalStateException("Admin không tồn tại"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            logger.warn("Người dùng {} cố gắng xóa Place nhưng không có vai trò ADMIN", adminEmail);
            throw new SecurityException("Chỉ có admin mới xóa được Place");
        }

        Place existingPlace = placeRepository.findById(placeId)
                .orElseThrow(() -> new IllegalStateException("Place với ID " + placeId + " không tồn tại"));

        transactionTemplate.execute(status -> {
            try {
                placeRepository.delete(existingPlace);
                placeRepository.flush();
                logger.info("Place với ID {} đã được xóa thành công", placeId);
                return null;
            } catch (Exception e) {
                logger.error("Không thể xóa Place với ID {}: {}", placeId, e.getMessage());
                throw new RuntimeException("Không thể xóa Place: " + e.getMessage());
            }
        });
    }

    public Page<HotelDTO> searchHotelByName(String name, int page, int size) {
        // Tạo Pageable với page (trừ 1 vì Spring Data đếm từ 0) và size
        Pageable pageable = PageRequest.of(page - 1, size);

        // Lấy dữ liệu phân trang từ repository
        Page<Hotel> hotelPage = hotelRepository.findByNameContainingIgnoreCase(pageable, name);

        // Chuyển đổi Page<Hotel> thành Page<HotelDTO>
        List<HotelDTO> hotelDTOs = hotelPage.getContent().stream()
                .map(this::convertToHotelDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(hotelDTOs, pageable, hotelPage.getTotalElements());
    }

    public Page<PlaceDTO> searchPlaceByTitle(String title, int page, int size) {
        // Tạo Pageable với page (trừ 1 vì Spring Data đếm từ 0) và size
        Pageable pageable = PageRequest.of(page - 1, size);

        // Lấy dữ liệu phân trang từ repository
        Page<Place> placePage = placeRepository.findByTitleContainingIgnoreCase(pageable, title);

        // Chuyển đổi Page<Hotel> thành Page<HotelDTO>
        List<PlaceDTO> placeDTOs = placePage.getContent().stream()
                .map(this::convertToPlaceDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(placeDTOs, pageable, placePage.getTotalElements());
    }

    public Page<RoomDTO> searchRoomByName(String name, int page, int size) {
        // Tạo Pageable với page (trừ 1 vì Spring Data đếm từ 0) và size
        Pageable pageable = PageRequest.of(page - 1, size);

        // Lấy dữ liệu phân trang từ repository
        Page<RoomType> roomPage = roomRepository.findByNameContainingIgnoreCase(pageable, name);

        // Chuyển đổi Page<Hotel> thành Page<HotelDTO>
        List<RoomDTO> roomDTOs = roomPage.getContent().stream()
                .map(this::convertToRoomDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(roomDTOs, pageable, roomPage.getTotalElements());
    }

    // Phương thức hỗ trợ để chuyển đổi từ entity sang DTO
    private HotelDTO convertToHotelDTO(Hotel hotel) {
        HotelDTO dto = new HotelDTO();
        dto.setId(hotel.getId());
        dto.setName(hotel.getName());
        dto.setAddress(hotel.getAddress());
        dto.setDistrict(hotel.getDistrict());
        dto.setDescription(hotel.getDescription());
        dto.setHotelLink(hotel.getHotelLink());
        dto.setRatingStars(hotel.getRatingStars());
        dto.setFacilities(hotel.getFacilities());
        dto.setHighlights(hotel.getHighlights());
        dto.setImageUrls(hotel.getImageUrls());
        dto.setReviews(hotel.getReviews());
        dto.setRoomServices(hotel.getRoomServices());
        dto.setSlug(hotel.getSlug());
        if (hotel.getCoordinates() != null) {
            dto.setLatitude(hotel.getCoordinates().getY());
            dto.setLongitude(hotel.getCoordinates().getX());
        }
        return dto;
    }

    private RoomDTO convertToRoomDTO(RoomType room) {
        RoomDTO dto = new RoomDTO();
        dto.setId(room.getId());
        dto.setName(room.getName());
        dto.setNumberOfGuests(room.getNumberOfGuests());
        dto.setPrice(room.getPrice());
        dto.setOriginalPrice(room.getOriginalPrice());
        dto.setTaxesAndFeesUnderPrice(room.getTaxesAndFeesUnderPrice());
        return dto;
    }

    private PlaceDTO convertToPlaceDTO(Place place) {
        PlaceDTO dto = new PlaceDTO();
        dto.setId(place.getId());
        dto.setTitle(place.getTitle());
        dto.setAddress(place.getAddress());
        dto.setRating(place.getRating());
        dto.setReview(place.getReview());
        dto.setSlug(place.getSlug());
        dto.setLatitude(place.getCoordinates() != null ? place.getCoordinates().getY() : null);
        dto.setLongitude(place.getCoordinates() != null ? place.getCoordinates().getX() : null);
        dto.setImageUrl(place.getImageUrl());
        dto.setDescription(place.getDescription());
        dto.setServices(place.getServices());
        return dto;
    }
}
