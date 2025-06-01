package com.example.AI.Hotel.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.AI.Hotel.common.DuplicateSlugException;
import com.example.AI.Hotel.dto.EmbeddingRequest;
import com.example.AI.Hotel.dto.HotelDTO;
import com.example.AI.Hotel.dto.PlaceDTO;
import com.example.AI.Hotel.dto.RoomDTO;
import com.example.AI.Hotel.model.Hotel;
import com.example.AI.Hotel.model.Place;
import com.example.AI.Hotel.model.RoomType;
import com.example.AI.Hotel.model.User;
import com.example.AI.Hotel.repository.*;
//import com.fasterxml.jackson.databind.ObjectMapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);

    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final PlaceRepository placeRepository;
    private final Cloudinary cloudinary;
    private final RestTemplate restTemplate;
    private final TransactionTemplate transactionTemplate;
    private static final String EMBEDDING_HOTEL_VECTOR = "https://anchinh-embeddingapi.hf.space/embedHotel";
    private static final String EMBEDDING_ROOM_VECTOR = "https://anchinh-embeddingapi.hf.space/embedRoom";
    private static final String EMBEDDING_PLACE_VECTOR = "https://anchinh-embeddingapi.hf.space/embedPlace";


    @Autowired
    public AdminService(UserRepository userRepository, HotelRepository hotelRepository, Cloudinary cloudinary, RoomRepository roomRepository, PlaceRepository placeRepository, HotelEmbeddingRepository hotelEmbeddingRepository, TransactionTemplate transactionTemplate) {
        this.userRepository = userRepository;
        this.hotelRepository = hotelRepository;
        this.cloudinary = cloudinary;
        this.roomRepository = roomRepository;
        this.placeRepository = placeRepository;
        this.transactionTemplate = transactionTemplate;
        this.restTemplate = new RestTemplate();
    }

    @Transactional
    public void disableUser(Integer userId) {
        // Lấy thông tin user hiện tại từ SecurityContext
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalStateException("Admin not found"));

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
                .orElseThrow(() -> new IllegalStateException("Admin not found"));

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

    public Hotel addHotel(HotelDTO hotelDTO, MultipartFile[] images) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalStateException("Admin not found"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            logger.warn("User {} attempted to add a hotel but lacks ADMIN role", adminEmail);
            throw new SecurityException("Chỉ có admin mới thêm được khách sạn");
        }

        Hotel hotel = new Hotel();
        hotel.setName(hotelDTO.getName());
        hotel.setAddress(hotelDTO.getAddress());
        hotel.setDistrict(hotelDTO.getDistrict());
        hotel.setDescription(hotelDTO.getDescription());
        hotel.setHotelLink(hotelDTO.getHotelLink());
        hotel.setRatingStars(hotelDTO.getRatingStars() != null ? hotelDTO.getRatingStars() : 0);
        hotel.setFacilities(hotelDTO.getFacilities());
        hotel.setHighlights(hotelDTO.getHighlights());
        hotel.setReviews(hotelDTO.getReviews());
        hotel.setRoomServices(hotelDTO.getRoomServices());
        hotel.setSlug(hotelDTO.getSlug());

        if (hotelDTO.getLatitude() != null && hotelDTO.getLongitude() != null) {
            GeometryFactory geometryFactory = new GeometryFactory();
            Coordinate coordinate = new Coordinate(hotelDTO.getLongitude(), hotelDTO.getLatitude());
            Point point = geometryFactory.createPoint(coordinate);
            point.setSRID(4326);
            hotel.setCoordinates(point);
        } else {
            hotel.setCoordinates(null);
        }

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
        hotel.setImageUrls(uploadedImageUrls.isEmpty() ? null : uploadedImageUrls);

        Hotel savedHotel = transactionTemplate.execute(status -> {
            try {
                Hotel hotelToSave = hotelRepository.save(hotel);
                hotelRepository.flush();
                return hotelToSave;
            } catch (DataIntegrityViolationException e) {
                if (e.getMessage().contains("hotels_slug_key")) {
                    throw new DuplicateSlugException("Khách sạn với slug '" + hotelDTO.getSlug() + "' đã tồn tại");
                }
                throw new RuntimeException("Failed to save hotel: " + e.getMessage());
            }
        });

        List<HotelDTO> hotelData = new ArrayList<>();
        HotelDTO dto = new HotelDTO();
        dto.setId(savedHotel.getId());
        dto.setName(savedHotel.getName());
        dto.setAddress(savedHotel.getAddress());
        dto.setDistrict(savedHotel.getDistrict());
        dto.setDescription(savedHotel.getDescription());
        dto.setHotelLink(savedHotel.getHotelLink());
        dto.setRatingStars(savedHotel.getRatingStars());
        dto.setFacilities(savedHotel.getFacilities());
        dto.setHighlights(savedHotel.getHighlights());
        dto.setReviews(savedHotel.getReviews());
        dto.setRoomServices(savedHotel.getRoomServices());
        dto.setSlug(savedHotel.getSlug());
        hotelData.add(dto);

        if (!hotelData.isEmpty()) {
            try {
                logger.info("Calling embedding API for hotel");

                EmbeddingRequest requestBody = new EmbeddingRequest(hotelData, "hotel");

                logger.info("Sending hotel data to embedding API: {}", hotelData);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                HttpEntity<EmbeddingRequest> requestEntity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<Map<String, String>> response = restTemplate.exchange(
                        EMBEDDING_HOTEL_VECTOR,
                        HttpMethod.POST,
                        requestEntity,
                        new ParameterizedTypeReference<Map<String, String>>() {}
                );

                logger.info("Embedding created for hotel ID: {}", savedHotel.getId());

            } catch (Exception e) {
                throw new RuntimeException("Không thể thêm được khách sạn với ID " + savedHotel.getId() + " vì không tạo được dữ liệu vector");
            }
        }

        return savedHotel;
    }

    public Hotel updateHotel(Integer hotelId, HotelDTO hotelDTO) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalStateException("Admin not found"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            logger.warn("User {} attempted to update a hotel but lacks ADMIN role", adminEmail);
            throw new SecurityException("Only admins can update hotels");
        }

        Hotel existingHotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new IllegalStateException("Hotel with ID " + hotelId + " not found"));

        existingHotel.setName(hotelDTO.getName() != null ? hotelDTO.getName() : existingHotel.getName());
        existingHotel.setAddress(hotelDTO.getAddress() != null ? hotelDTO.getAddress() : existingHotel.getAddress());
        existingHotel.setDistrict(hotelDTO.getDistrict() != null ? hotelDTO.getDistrict() : existingHotel.getDistrict());
        existingHotel.setDescription(hotelDTO.getDescription() != null ? hotelDTO.getDescription() : existingHotel.getDescription());
        existingHotel.setHotelLink(hotelDTO.getHotelLink() != null ? hotelDTO.getHotelLink() : existingHotel.getHotelLink());
        existingHotel.setRatingStars(hotelDTO.getRatingStars() != null ? hotelDTO.getRatingStars() : existingHotel.getRatingStars());
        existingHotel.setFacilities(hotelDTO.getFacilities() != null ? hotelDTO.getFacilities() : existingHotel.getFacilities());
        existingHotel.setHighlights(hotelDTO.getHighlights() != null ? hotelDTO.getHighlights() : existingHotel.getHighlights());
        existingHotel.setReviews(hotelDTO.getReviews() != null ? hotelDTO.getReviews() : existingHotel.getReviews());
        existingHotel.setRoomServices(hotelDTO.getRoomServices() != null ? hotelDTO.getRoomServices() : existingHotel.getRoomServices());
        existingHotel.setImageUrls(hotelDTO.getImageUrls() != null ? hotelDTO.getImageUrls() : existingHotel.getImageUrls());

        if (hotelDTO.getLatitude() != null && hotelDTO.getLongitude() != null) {
            GeometryFactory geometryFactory = new GeometryFactory();
            Coordinate coordinate = new Coordinate(hotelDTO.getLongitude(), hotelDTO.getLatitude());
            Point point = geometryFactory.createPoint(coordinate);
            point.setSRID(4326);
            existingHotel.setCoordinates(point);
        }

        Hotel updatedHotel = transactionTemplate.execute(status -> {
            try {
                Hotel hotelToSave = hotelRepository.save(existingHotel);
                hotelRepository.flush();

                List<HotelDTO> hotelData = new ArrayList<>();
                HotelDTO dto = new HotelDTO();
                dto.setId(hotelToSave.getId());
                dto.setName(hotelToSave.getName());
                dto.setAddress(hotelToSave.getAddress());
                dto.setDistrict(hotelToSave.getDistrict());
                dto.setDescription(hotelToSave.getDescription());
                dto.setHotelLink(hotelToSave.getHotelLink());
                dto.setRatingStars(hotelToSave.getRatingStars());
                dto.setFacilities(hotelToSave.getFacilities());
                dto.setHighlights(hotelToSave.getHighlights());
                dto.setReviews(hotelToSave.getReviews());
                dto.setRoomServices(hotelToSave.getRoomServices());
                dto.setSlug(hotelToSave.getSlug());
                hotelData.add(dto);

                if (!hotelData.isEmpty()) {
                    logger.info("Calling embedding API for hotel update");

                    EmbeddingRequest requestBody = new EmbeddingRequest(hotelData, "hotel");

                    logger.info("Sending hotel data to embedding API: {}", hotelData);

                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_JSON);

                    HttpEntity<EmbeddingRequest> requestEntity = new HttpEntity<>(requestBody, headers);
                    ResponseEntity<Map<String, String>> response = restTemplate.exchange(
                            EMBEDDING_HOTEL_VECTOR,
                            HttpMethod.POST,
                            requestEntity,
                            new ParameterizedTypeReference<Map<String, String>>() {}
                    );

                    logger.info("Embedding updated for hotel ID: {}", hotelToSave.getId());
                }

                return hotelToSave;

            } catch (DataIntegrityViolationException e) {
                if (e.getMessage().contains("hotels_slug_key")) {
                    throw new DuplicateSlugException("Slug conflict detected (should not occur as slug is not updated)");
                }
                throw new RuntimeException("Failed to update hotel: " + e.getMessage());
            } catch (Exception e) {
                logger.error("Error during update: {}", e.getMessage());
                throw new RuntimeException("Không thể cập nhật được dữ liệu khách sạn vì không tạo được vector");
            }
        });

        return updatedHotel;
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
//                placeRepository.flush();
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
//                roomRepository.flush(); //flush() ép các thay đổi trong Persistence Context được áp dụng ngay lập tức xuống database, mà không cần đợi đến khi giao dịch commit.
                logger.info("Rooms with IDs {} have been deleted successfully", roomIds);
                return null;
            } catch (Exception e) {
                logger.error("Failed to delete hotels with IDs {}: {}", roomIds, e.getMessage());
                throw new RuntimeException("Failed to delete places: " + e.getMessage());
            }
        });
    }

    public RoomType addRoom(RoomDTO roomDTO) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalStateException("Admin not found"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            logger.warn("User {} attempted to add a room but lacks ADMIN role", adminEmail);
            throw new SecurityException("Only admins can add rooms");
        }

        Hotel hotel = hotelRepository.findById(roomDTO.getHotelId())
                .orElseThrow(() -> new IllegalStateException("Hotel with ID " + roomDTO.getHotelId() + " not found"));

        RoomType room = new RoomType();
        room.setHotel(hotel);
        room.setName(roomDTO.getName());
        room.setNumberOfGuests(roomDTO.getNumberOfGuests());
        room.setPrice(roomDTO.getPrice());
        room.setOriginalPrice(roomDTO.getOriginalPrice());
        room.setTaxesAndFeesUnderPrice(roomDTO.getTaxesAndFeesUnderPrice() != null ? roomDTO.getTaxesAndFeesUnderPrice() : false);

        // Lưu RoomType trước
        RoomType savedRoom = transactionTemplate.execute(status -> {
            try {
                RoomType roomToSave = roomRepository.save(room);
                roomRepository.flush();
                return roomToSave;
            } catch (Exception e) {
                logger.error("Error during saving room: {}", e.getMessage());
                throw new RuntimeException("Không thể lưu dữ liệu phòng: " + e.getMessage());
            }
        });

        // Sau khi giao dịch commit, gọi API /embedRoom
        List<RoomDTO> roomData = new ArrayList<>();
        RoomDTO dto = new RoomDTO();
        dto.setId(savedRoom.getId());
        dto.setHotelId(savedRoom.getHotel().getId());
        dto.setName(savedRoom.getName());
        dto.setNumberOfGuests(savedRoom.getNumberOfGuests());
        dto.setPrice(savedRoom.getPrice());
        dto.setOriginalPrice(savedRoom.getOriginalPrice());
        dto.setTaxesAndFeesUnderPrice(savedRoom.getTaxesAndFeesUnderPrice());
        roomData.add(dto);

        try {
            logger.info("Calling embedding API for room with roomData: {}", roomData);
            EmbeddingRequest requestBody = new EmbeddingRequest(roomData, "room");
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<EmbeddingRequest> requestEntity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map<String, String>> response = restTemplate.exchange(
                    EMBEDDING_ROOM_VECTOR,
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<Map<String, String>>() {}
            );
            logger.info("Embedding created for room ID: {}", savedRoom.getId());
        } catch (Exception e) {
            logger.error("Error during embedding creation: {}", e.getMessage());
            // Rollback: Xóa bản ghi đã lưu trong room_types
            transactionTemplate.execute(status -> {
                try {
                    roomRepository.delete(savedRoom);
                    roomRepository.flush();
                    logger.info("Rolled back room with ID: {}", savedRoom.getId());
                    return null;
                } catch (Exception rollbackEx) {
                    logger.error("Failed to rollback room deletion: {}", rollbackEx.getMessage());
                    throw new RuntimeException("Failed to rollback: " + rollbackEx.getMessage());
                }
            });
            throw new RuntimeException("Không thể thêm dữ liệu phòng vì lỗi tạo embedding: " + e.getMessage());
        }

        return savedRoom;
    }

    public RoomType updateRoom(Integer roomId, RoomDTO roomDTO) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalStateException("Admin not found"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            logger.warn("User {} attempted to update a room but lacks ADMIN role", adminEmail);
            throw new SecurityException("Only admins can update rooms");
        }

        RoomType existingRoom = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalStateException("Room with ID " + roomId + " not found"));

        // Lưu trạng thái ban đầu để rollback nếu cần
        RoomType originalRoom = new RoomType();
        originalRoom.setId(existingRoom.getId());
        originalRoom.setHotel(existingRoom.getHotel());
        originalRoom.setName(existingRoom.getName());
        originalRoom.setNumberOfGuests(existingRoom.getNumberOfGuests());
        originalRoom.setPrice(existingRoom.getPrice());
        originalRoom.setOriginalPrice(existingRoom.getOriginalPrice());
        originalRoom.setTaxesAndFeesUnderPrice(existingRoom.getTaxesAndFeesUnderPrice());

        // Cập nhật các trường
        existingRoom.setName(roomDTO.getName() != null ? roomDTO.getName() : existingRoom.getName());
        existingRoom.setNumberOfGuests(roomDTO.getNumberOfGuests() != null ? roomDTO.getNumberOfGuests() : existingRoom.getNumberOfGuests());
        existingRoom.setPrice(roomDTO.getPrice() != null ? roomDTO.getPrice() : existingRoom.getPrice());
        existingRoom.setOriginalPrice(roomDTO.getOriginalPrice() != null ? roomDTO.getOriginalPrice() : existingRoom.getOriginalPrice());
        existingRoom.setTaxesAndFeesUnderPrice(roomDTO.getTaxesAndFeesUnderPrice() != null ? roomDTO.getTaxesAndFeesUnderPrice() : existingRoom.getTaxesAndFeesUnderPrice());

        // Lưu RoomType trước
        RoomType updatedRoom = transactionTemplate.execute(status -> {
            try {
                RoomType roomToSave = roomRepository.save(existingRoom);
                roomRepository.flush();
                return roomToSave;
            } catch (Exception e) {
                logger.error("Error during updating room: {}", e.getMessage());
                throw new RuntimeException("Không thể cập nhật dữ liệu phòng: " + e.getMessage());
            }
        });

        // Sau khi giao dịch commit, gọi API /embedRoom
        List<RoomDTO> roomData = new ArrayList<>();
        RoomDTO dto = new RoomDTO();
        dto.setId(updatedRoom.getId());
        dto.setHotelId(updatedRoom.getHotel().getId()); // Thêm hotelId từ RoomType hiện tại
        dto.setName(updatedRoom.getName());
        dto.setNumberOfGuests(updatedRoom.getNumberOfGuests());
        dto.setPrice(updatedRoom.getPrice());
        dto.setOriginalPrice(updatedRoom.getOriginalPrice());
        dto.setTaxesAndFeesUnderPrice(updatedRoom.getTaxesAndFeesUnderPrice());
        roomData.add(dto);

        try {
            logger.info("Calling embedding API for room update with roomData: {}", roomData);
            EmbeddingRequest requestBody = new EmbeddingRequest(roomData, "room");
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<EmbeddingRequest> requestEntity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map<String, String>> response = restTemplate.exchange(
                    EMBEDDING_ROOM_VECTOR,
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<Map<String, String>>() {}
            );
            logger.info("Embedding updated for room ID: {}", updatedRoom.getId());
        } catch (Exception e) {
            logger.error("Error during embedding update: {}", e.getMessage());
            // Rollback: Khôi phục trạng thái ban đầu của RoomType
            transactionTemplate.execute(status -> {
                try {
                    originalRoom.setId(updatedRoom.getId()); // Giữ nguyên ID
                    roomRepository.save(originalRoom);
                    roomRepository.flush();
                    logger.info("Rolled back room update for ID: {}", updatedRoom.getId());
                    return null;
                } catch (Exception rollbackEx) {
                    logger.error("Failed to rollback room update: {}", rollbackEx.getMessage());
                    throw new RuntimeException("Failed to rollback: " + rollbackEx.getMessage());
                }
            });
            throw new RuntimeException("Không thể cập nhật dữ liệu phòng vì lỗi tạo embedding: " + e.getMessage());
        }

        return updatedRoom;
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

    public Place addPlace(PlaceDTO placeDTO, MultipartFile[] images) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalStateException("Admin not found"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            logger.warn("User {} attempted to add a place but lacks ADMIN role", adminEmail);
            throw new SecurityException("Chỉ có admin mới thêm được địa điểm");
        }

        Place place = new Place();
        place.setTitle(placeDTO.getTitle());
        place.setAddress(placeDTO.getAddress());
        place.setRating(placeDTO.getRating() != null ? placeDTO.getRating() : 0.0f);
        place.setReview(placeDTO.getReview() != null ? placeDTO.getReview() : 0);
        place.setSlug(placeDTO.getSlug());
        place.setDescription(placeDTO.getDescription());
        place.setServices(placeDTO.getServices());

        // Xử lý tọa độ
        if (placeDTO.getLatitude() != null && placeDTO.getLongitude() != null) {
            GeometryFactory geometryFactory = new GeometryFactory();
            Coordinate coordinate = new Coordinate(placeDTO.getLongitude(), placeDTO.getLatitude());
            Point point = geometryFactory.createPoint(coordinate);
            point.setSRID(4326);
            place.setCoordinates(point);
        } else {
            place.setCoordinates(null);
        }

        String uploadedImageUrl = null;
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
                    uploadedImageUrl = uploadedUrl;
                    logger.info("Uploaded image to Cloudinary: {}", uploadedUrl);
                    break; // Thoát sau khi upload file đầu tiên

                } catch (Exception e) {
                    logger.error("Error uploading image to Cloudinary: {}", image != null ? image.getOriginalFilename() : "null", e);
                }
            }
        }
        place.setImageUrl(uploadedImageUrl);

        Place savedPlace = transactionTemplate.execute(status -> {
            try {
                Place placeToSave = placeRepository.save(place);
                placeRepository.flush();
                return placeToSave;
            } catch (DataIntegrityViolationException e) {
                if (e.getMessage().contains("places_slug_key")) {
                    throw new DuplicateSlugException("Địa điểm với slug '" + placeDTO.getSlug() + "' đã tồn tại");
                }
                throw new RuntimeException("Failed to save place: " + e.getMessage());
            }
        });

        List<PlaceDTO> placeData = new ArrayList<>();
        PlaceDTO dto = new PlaceDTO();
        dto.setId(savedPlace.getId());
        dto.setTitle(savedPlace.getTitle());
        dto.setAddress(savedPlace.getAddress());
        dto.setRating(savedPlace.getRating());
        dto.setReview(savedPlace.getReview());
        dto.setSlug(savedPlace.getSlug());
//        dto.setLatitude(savedPlace.getLatitude());
//        dto.setLongitude(savedPlace.getLongitude());
        dto.setImageUrl(savedPlace.getImageUrl());
        dto.setDescription(savedPlace.getDescription());
        dto.setServices(savedPlace.getServices());
        placeData.add(dto);

        if (!placeData.isEmpty()) {
            try {
                logger.info("Calling embedding API for place");

                EmbeddingRequest requestBody = new EmbeddingRequest();
                requestBody.setPlaceData(placeData);

                logger.info("Sending place data to embedding API: {}", placeData);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                HttpEntity<EmbeddingRequest> requestEntity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<Map<String, String>> response = restTemplate.exchange(
                        EMBEDDING_PLACE_VECTOR,
                        HttpMethod.POST,
                        requestEntity,
                        new ParameterizedTypeReference<Map<String, String>>() {}
                );

                logger.info("Embedding created for place ID: {}", savedPlace.getId());

            } catch (Exception e) {
                throw new RuntimeException("Không thể thêm được địa điểm với ID " + savedPlace.getId() + " vì không tạo được dữ liệu vector");
            }
        }

        return savedPlace;
    }

    public Place updatePlace(PlaceDTO placeDTO) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalStateException("Admin not found"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            logger.warn("User {} attempted to update a place but lacks ADMIN role", adminEmail);
            throw new SecurityException("Chỉ có admin mới cập nhật được địa điểm");
        }

        // Tìm địa điểm hiện tại
        Place existingPlace = placeRepository.findById(placeDTO.getId())
                .orElseThrow(() -> new IllegalArgumentException("Địa điểm với ID " + placeDTO.getId() + " không tồn tại"));

        // Cập nhật thông tin
        existingPlace.setTitle(placeDTO.getTitle());
        existingPlace.setAddress(placeDTO.getAddress());
        existingPlace.setRating(placeDTO.getRating() != null ? placeDTO.getRating() : 0.0f);
        existingPlace.setReview(placeDTO.getReview() != null ? placeDTO.getReview() : 0);
        existingPlace.setSlug(placeDTO.getSlug());
        existingPlace.setDescription(placeDTO.getDescription());
        existingPlace.setServices(placeDTO.getServices());
        existingPlace.setImageUrl(placeDTO.getImageUrl());

        // Xử lý tọa độ
        if (placeDTO.getLatitude() != null && placeDTO.getLongitude() != null) {
            GeometryFactory geometryFactory = new GeometryFactory();
            Coordinate coordinate = new Coordinate(placeDTO.getLongitude(), placeDTO.getLatitude());
            Point point = geometryFactory.createPoint(coordinate);
            point.setSRID(4326);
            existingPlace.setCoordinates(point);
        } else {
            existingPlace.setCoordinates(null);
        }

//        // Xử lý hình ảnh
//        String uploadedImageUrl = existingPlace.getImageUrl(); // Giữ URL hiện tại nếu không upload mới
//        if (images != null && images.length > 0) {
//            logger.info("Received {} image files for update", images.length);
//            for (MultipartFile image : images) {
//                try {
//                    if (image == null || image.isEmpty()) {
//                        logger.warn("Skipping empty file: {}", image != null ? image.getOriginalFilename() : "null");
//                        continue;
//                    }
//
//                    String contentType = image.getContentType();
//                    if (contentType == null || !contentType.matches("image/(jpeg|png|jpg)")) {
//                        logger.warn("Unsupported file format for file: {}. Expected JPEG, PNG, or JPG.", image.getOriginalFilename());
//                        continue;
//                    }
//
//                    byte[] fileBytes = image.getBytes();
//                    if (fileBytes.length == 0) {
//                        logger.warn("File is empty after reading: {}", image.getOriginalFilename());
//                        continue;
//                    }
//
//                    String originalFilename = image.getOriginalFilename();
//                    String publicId = originalFilename != null ?
//                            originalFilename.replaceAll("[^a-zA-Z0-9-_]", "_") : UUID.randomUUID().toString();
//
//                    Map uploadResult = cloudinary.uploader().upload(fileBytes, ObjectUtils.asMap(
//                            "folder", "places/" + (placeDTO.getSlug() != null ? placeDTO.getSlug() : "default"),
//                            "resource_type", "image",
//                            "public_id", publicId
//                    ));
//
//                    String uploadedUrl = (String) uploadResult.get("secure_url");
//                    uploadedImageUrl = uploadedUrl;
//                    logger.info("Uploaded new image to Cloudinary: {}", uploadedUrl);
//                    break; // Thoát sau khi upload file đầu tiên
//
//                } catch (Exception e) {
//                    logger.error("Error uploading image to Cloudinary: {}", image != null ? image.getOriginalFilename() : "null", e);
//                }
//            }
//        }
//        existingPlace.setImageUrl(uploadedImageUrl);

        // Lưu thay đổi
        Place updatedPlace = transactionTemplate.execute(status -> {
            try {
                Place placeToSave = placeRepository.save(existingPlace);
                placeRepository.flush();
                return placeToSave;
            } catch (Exception e) {
                throw new RuntimeException("Failed to update place: " + e.getMessage());
            }
        });

        // Chuẩn bị dữ liệu cho embedding (không bao gồm latitude và longitude)
        List<PlaceDTO> placeData = new ArrayList<>();
        PlaceDTO dto = new PlaceDTO();
        dto.setId(updatedPlace.getId());
        dto.setTitle(updatedPlace.getTitle());
        dto.setAddress(updatedPlace.getAddress());
        dto.setRating(updatedPlace.getRating());
        dto.setReview(updatedPlace.getReview());
        dto.setSlug(updatedPlace.getSlug());
        dto.setImageUrl(updatedPlace.getImageUrl());
        dto.setDescription(updatedPlace.getDescription());
        dto.setServices(updatedPlace.getServices());
        placeData.add(dto);

        if (!placeData.isEmpty()) {
            try {
                logger.info("Calling embedding API for updated place");

                EmbeddingRequest requestBody = new EmbeddingRequest();
                requestBody.setPlaceData(placeData);

                logger.info("Sending updated place data to embedding API: {}", placeData);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                HttpEntity<EmbeddingRequest> requestEntity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<Map<String, String>> response = restTemplate.exchange(
                        EMBEDDING_PLACE_VECTOR,
                        HttpMethod.POST,
                        requestEntity,
                        new ParameterizedTypeReference<Map<String, String>>() {}
                );

                logger.info("Embedding updated for place ID: {}", updatedPlace.getId());

            } catch (Exception e) {
                throw new RuntimeException("Không thể cập nhật địa điểm với ID " + updatedPlace.getId() + " vì không tạo được dữ liệu vector");
            }
        }

        return updatedPlace;
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
