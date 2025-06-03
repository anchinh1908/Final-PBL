package com.example.AI.Hotel.service;

import com.example.AI.Hotel.dto.*;
import com.example.AI.Hotel.model.*;
import com.example.AI.Hotel.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.io.WKTReader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import jakarta.validation.Valid;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class HotelSearchService {
    private static final Logger logger = LoggerFactory.getLogger(HotelSearchService.class);

    private static final double SIMILARITY_THRESHOLD = 0.6;
    private static final double ROOM_SIMILARITY_THRESHOLD = 0.4;
    private static final int MAX_HOTELS = 80;
    private static final int MAX_ROOMS = 200;
    private static final String EMBEDDING_API_URL = "https://anchinh-embeddingapi.hf.space/embed";
    private static final double DEFAULT_MAX_DISTANCE_METERS = 5000; // Bán kính mặc định 5km

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final PlaceRepository placeRepository;
    private final SearchHistoryRepository searchHistoryRepository; // Thêm repository để lưu lịch sử
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    public HotelSearchService(
            HotelRepository hotelRepository,
            RoomRepository roomRepository,
            PlaceRepository placeRepository,
            HotelEmbeddingRepository hotelEmbeddingRepository,
            PlaceEmbeddingRepository placeEmbeddingRepository,
            SearchHistoryRepository searchHistoryRepository,
            UserRepository userRepository,
            ObjectMapper objectMapper
    ) {
        this.hotelRepository = hotelRepository;
        this.roomRepository = roomRepository;
        this.placeRepository = placeRepository;
        this.searchHistoryRepository = searchHistoryRepository;
        this.userRepository = userRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
    }

    @Transactional
    public List<HotelSearchResponse> searchHotels(@Valid HotelSearchRequest request) {
        logger.info("Processing search query: {}", request.getQuery());

        try {
            // Gọi API Python để tạo embedding
            float[] queryEmbedding = getQueryEmbedding(request.getQuery());
            logger.debug("Query embedding created, length: {}", queryEmbedding.length);

            // Tìm các khách sạn và phòng phù hợp
            List<HotelSearchResponse> results = findMatchingHotelsWithRooms(queryEmbedding);

            // Sắp xếp theo độ tương đồng của khách sạn
            results.sort(Comparator.comparingDouble(HotelSearchResponse::getSimilarityScore).reversed());
            logger.info("Found {} matching hotels after room filtering", results.size());

            // Lưu lịch sử tìm kiếm chỉ khi user đã đăng nhập
            String email = SecurityContextHolder.getContext().getAuthentication() != null
                    ? SecurityContextHolder.getContext().getAuthentication().getName()
                    : null;
            if (email != null && !email.trim().isEmpty() && !email.equals("anonymousUser")) {
                User user = userRepository.findByEmail(email)
                        .orElseThrow(() -> new IllegalStateException("Không tìm thấy người dùng với email: " + email));
                saveSearchHistory(request.getQuery(), user);
            } else {
                logger.warn("Skipping search history save: No authenticated user or anonymous user detected");
            }

            return results;

        } catch (Exception e) {
            logger.error("Error processing search query: {}", request.getQuery(), e);
            throw new RuntimeException("Failed to process search query", e);
        }
    }

    private List<HotelSearchResponse> findMatchingHotelsWithRooms(float[] queryEmbedding) {
        List<HotelSearchResponse> responses = new ArrayList<>();

        String queryEmbeddingStr = arrayToString(queryEmbedding); // chuyển query dạng float[] sang String

        // Bước 1: Tìm các khách sạn phù hợp dựa trên hotel_embeddings
        List<Object[]> similarHotels = hotelRepository.findTopSimilarHotels(
                queryEmbeddingStr, SIMILARITY_THRESHOLD, MAX_HOTELS);
        logger.info("Hotels above threshold ({}): {}", SIMILARITY_THRESHOLD, similarHotels.size());

        if (similarHotels.isEmpty()) {
            logger.warn("No hotels found above similarity threshold {}. Checking all hotels for debug...", SIMILARITY_THRESHOLD);
            List<Object[]> allHotels = hotelRepository.findTopSimilarHotels(queryEmbeddingStr, 0.0, 10);
            for (Object[] result : allHotels) {
                Integer hotelId = (Integer) result[0];
                double similarity = (Double) result[2];
                logger.debug("Debug - Hotel ID: {}, Similarity: {}", hotelId, similarity);
            }
            return responses;
        }

        List<Integer> hotelIds = similarHotels.stream()
                .map(result -> (Integer) result[0])
                .toList();

        // Bước 2: Tìm các phòng phù hợp dựa trên room_embeddings
        List<Object[]> similarRooms = roomRepository.findTopSimilarRooms(
                queryEmbeddingStr, ROOM_SIMILARITY_THRESHOLD, MAX_ROOMS);
        logger.info("Rooms above threshold ({}): {}", ROOM_SIMILARITY_THRESHOLD, similarRooms.size());

        if (similarRooms.isEmpty()) {
            logger.warn("No rooms found above similarity threshold {}. Checking all rooms for debug...", ROOM_SIMILARITY_THRESHOLD);
            List<Object[]> allRooms = roomRepository.findTopSimilarRooms(queryEmbeddingStr, 0.0, 10);
            for (Object[] result : allRooms) {
                Integer roomId = (Integer) result[0];
                double similarity = (Double) result[2];
                logger.debug("Debug - Room ID: {}, Similarity: {}", roomId, similarity);
            }
            return responses; // Không có phòng phù hợp, trả về danh sách rỗng
        }

        // Lấy danh sách ID phòng và khách sạn tương ứng
        List<Integer> roomIds = similarRooms.stream()
                .map(result -> (Integer) result[0])
                .collect(Collectors.toList());

        List<Integer> roomHotelIds = roomRepository.findHotelIdsByRoomIds(roomIds);
        List<Integer> filteredHotelIds = hotelIds.stream()
                .filter(hotelId -> roomHotelIds.contains(hotelId))
                .collect(Collectors.toList());

        if (filteredHotelIds.isEmpty()) {
            logger.info("No hotels have rooms matching the room similarity threshold.");
            return responses;
        }

        // Lấy thông tin khách sạn và phòng
        List<Hotel> hotels = hotelRepository.findAllById(filteredHotelIds);
        List<RoomType> relevantRoomTypes = roomRepository.findByIdIn(roomIds);

        // Bước 3: Xây dựng kết quả
        for (Object[] hotelResult : similarHotels) {
            Integer hotelId = (Integer) hotelResult[0];
            if (!filteredHotelIds.contains(hotelId)) {
                continue; // Bỏ qua khách sạn không có phòng phù hợp
            }

            double hotelSimilarity = (Double) hotelResult[2];
            logger.debug("Processing Hotel ID: {}, Similarity: {}", hotelId, hotelSimilarity);

            Optional<Hotel> hotelOpt = hotels.stream().filter(h -> h.getId().equals(hotelId)).findFirst();
            if (hotelOpt.isEmpty()) {
                logger.warn("Hotel not found for ID: {}", hotelId);
                continue;
            }
            Hotel hotel = hotelOpt.get();

            // Lấy các phòng phù hợp với khách sạn này
            List<RoomType> hotelRooms = relevantRoomTypes.stream()
                    .filter(rt -> rt.getHotel().getId().equals(hotelId))
                    .toList();

            if (hotelRooms.isEmpty()) {
                logger.debug("No matching rooms for Hotel ID: {}", hotelId);
                continue; // Bỏ qua khách sạn không có phòng phù hợp
            }

            HotelSearchResponse response = new HotelSearchResponse();
            response.setHotel(toHotelDTO(hotel));
            response.setSimilarityScore(hotelSimilarity);

            // Thêm thông tin phòng và similarity score của từng phòng
            List<RoomDTO> rooms = new ArrayList<>();
            for (RoomType room : hotelRooms) {
                RoomDTO roomDTO = toRoomDTO(room);
                // Tìm similarity score của phòng
                Optional<Object[]> roomResultOpt = similarRooms.stream()
                        .filter(r -> ((Integer) r[0]).equals(room.getId()))
                        .findFirst();
                if (roomResultOpt.isPresent()) {
                    double roomSimilarity = (Double) roomResultOpt.get()[2];
                    roomDTO.setSimilarityScore(roomSimilarity); // Giả sử RoomDTO có trường similarityScore
                }
                rooms.add(roomDTO);
            }
            response.setRooms(rooms);

            responses.add(response);
        }

        return responses;
    }

    // OLD
private List<HotelSearchResponse> findMatchingHotels(float[] queryEmbedding) {
    List<HotelSearchResponse> responses = new ArrayList<>();

    String queryEmbeddingStr = arrayToString(queryEmbedding); // Chuyển query dạng float[] sang String

    // Bước 1: Tìm các khách sạn phù hợp dựa trên hotel_embeddings
    List<Object[]> similarHotels = hotelRepository.findTopSimilarHotels(
            queryEmbeddingStr, SIMILARITY_THRESHOLD, MAX_HOTELS);
    logger.info("Hotels above threshold ({}): {}", SIMILARITY_THRESHOLD, similarHotels.size());

    if (similarHotels.isEmpty()) {
        logger.warn("No hotels found above similarity threshold {}. Checking all hotels for debug...", SIMILARITY_THRESHOLD);
        List<Object[]> allHotels = hotelRepository.findTopSimilarHotels(queryEmbeddingStr, 0.0, 10);
        for (Object[] result : allHotels) {
            Integer hotelId = (Integer) result[0];
            double similarity = (Double) result[2];
            logger.debug("Debug - Hotel ID: {}, Similarity: {}", hotelId, similarity);
        }
        return responses;
    }

    List<Integer> hotelIds = similarHotels.stream()
            .map(result -> (Integer) result[0])
            .toList();

    // Lấy thông tin khách sạn
    List<Hotel> hotels = hotelRepository.findAllById(hotelIds);

    // Lấy tất cả các phòng liên quan đến các khách sạn được tìm thấy (không lọc theo ngưỡng similarity của phòng)
    List<Integer> allRoomHotelIds = hotelIds; // Dùng hotelIds để lấy tất cả phòng của các khách sạn này
    List<RoomType> allRelevantRoomTypes = roomRepository.findByHotelIds(allRoomHotelIds);

    // Bước 2: Xây dựng kết quả
    for (Object[] hotelResult : similarHotels) {
        Integer hotelId = (Integer) hotelResult[0];
        double hotelSimilarity = (Double) hotelResult[2];
        logger.debug("Processing Hotel ID: {}, Similarity: {}", hotelId, hotelSimilarity);

        Optional<Hotel> hotelOpt = hotels.stream().filter(h -> h.getId().equals(hotelId)).findFirst();
        if (hotelOpt.isEmpty()) {
            logger.warn("Hotel not found for ID: {}", hotelId);
            continue;
        }
        Hotel hotel = hotelOpt.get();

        // Lấy tất cả các phòng của khách sạn này (không cần lọc theo similarity)
        List<RoomType> hotelRooms = allRelevantRoomTypes.stream()
                .filter(rt -> rt.getHotel().getId().equals(hotelId))
                .toList();

        if (hotelRooms.isEmpty()) {
            logger.debug("No rooms found for Hotel ID: {}", hotelId);
            continue; // Bỏ qua nếu không có phòng, nhưng vẫn có thể giữ tùy ý
        }

        HotelSearchResponse response = new HotelSearchResponse();
        response.setHotel(toHotelDTO(hotel));
        response.setSimilarityScore(hotelSimilarity);

        // Thêm thông tin phòng (không có similarity score cho phòng vì bỏ ngưỡng)
        List<RoomDTO> rooms = new ArrayList<>();
        for (RoomType room : hotelRooms) {
            RoomDTO roomDTO = toRoomDTO(room);
            rooms.add(roomDTO); // Không set similarityScore cho phòng
        }
        response.setRooms(rooms);
//        response.setPlaces(List.of()); // Tạm thời để trống, có thể cập nhật sau

        responses.add(response);
    }

    return responses;
}

    @Transactional
    public List<HotelSearchResponse> searchHotelsV2(@Valid HotelSearchRequest request) {
        logger.info("Processing search query (v2): {}", request.getQuery());

        try {
            // Gọi API Python để tạo embedding
            float[] queryEmbedding = getQueryEmbedding(request.getQuery());
            logger.debug("Query embedding created, length: {}", queryEmbedding.length);

            // Tìm các khách sạn phù hợp
            List<HotelSearchResponse> results = findMatchingHotelsV2(queryEmbedding);

            // Sắp xếp theo độ tương đồng
            results.sort(Comparator.comparingDouble(HotelSearchResponse::getSimilarityScore).reversed());
            logger.info("Found {} matching hotels (v2)", results.size());

            // Lưu lịch sử tìm kiếm chỉ khi user đã đăng nhập
            String email = SecurityContextHolder.getContext().getAuthentication() != null
                    ? SecurityContextHolder.getContext().getAuthentication().getName()
                    : null;
            if (email != null && !email.trim().isEmpty() && !email.equals("anonymousUser")) {
                User user = userRepository.findByEmail(email)
                        .orElseThrow(() -> new IllegalStateException("User not found with email: " + email));
                saveSearchHistory(request.getQuery(), user);
            } else {
                logger.warn("Skipping search history save: No authenticated user or anonymous user detected");
            }

            return results;

        } catch (Exception e) {
            logger.error("Error processing search query (v2): {}", request.getQuery(), e);
            throw new RuntimeException("Failed to process search query (v2)", e);
        }
    }

    private List<HotelSearchResponse> findMatchingHotelsV2(float[] queryEmbedding) {
        List<HotelSearchResponse> responses = new ArrayList<>();

        String queryEmbeddingStr = arrayToString(queryEmbedding);
        logger.debug("Query embedding string: {}", queryEmbeddingStr); // Log để kiểm tra định dạng

        List<Object[]> similarHotels = hotelRepository.findTopSimilarHotels(
                queryEmbeddingStr, SIMILARITY_THRESHOLD, MAX_HOTELS);
        logger.info("Hotels above threshold (v2) ({}): {}", SIMILARITY_THRESHOLD, similarHotels.size());

        if (similarHotels.isEmpty()) {
            logger.warn("No hotels found above similarity threshold (v2) {}. Checking all hotels for debug...", SIMILARITY_THRESHOLD);
            List<Object[]> allHotels = hotelRepository.findTopSimilarHotelsForSearchV2(queryEmbeddingStr, 0.0, 10);
            for (Object[] result : allHotels) {
                Integer hotelId = (Integer) result[0];
                double similarity = (Double) result[2];
                logger.debug("Debug (v2) - Hotel ID: {}, Similarity: {}", hotelId, similarity);
            }
            return responses;
        }

        List<Integer> hotelIds = similarHotels.stream()
                .map(result -> (Integer) result[0])
                .collect(Collectors.toList());

        List<Hotel> hotels = hotelRepository.findAllById(hotelIds);
        for (Object[] result : similarHotels) {
            Integer hotelId = (Integer) result[0];
            double similarity = (Double) result[2];
            logger.debug("Processing Hotel ID (v2): {}, Similarity: {}", hotelId, similarity);

            Optional<Hotel> hotelOpt = hotels.stream().filter(h -> h.getId().equals(hotelId)).findFirst();
            if (hotelOpt.isEmpty()) {
                logger.warn("Hotel not found for ID (v2): {}", hotelId);
                continue;
            }
            Hotel hotel = hotelOpt.get();

            HotelSearchResponse response = new HotelSearchResponse();
            response.setHotel(toHotelDTO(hotel));
            response.setSimilarityScore(similarity);
//            response.setRooms(List.of()); // Để trống

            responses.add(response);
        }
        return responses;
    }

//    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')") // Vẫn yêu cầu token vì liên quan đến dữ liệu địa điểm
    @Transactional(readOnly = true)
    public List<PlaceDTO> findNearbyPlaces(Integer hotelId, Double maxDistance, Integer limit) {
        logger.info("Finding nearby places for hotel ID: {}", hotelId);

        // Kiểm tra xem khách sạn có tồn tại không
        Optional<Hotel> hotelOpt = hotelRepository.findById(hotelId);
        if (hotelOpt.isEmpty()) {
            logger.warn("Hotel not found for ID: {}", hotelId);
            throw new RuntimeException("Hotel not found with ID: " + hotelId);
        }

        // Nếu maxDistance không được cung cấp, sử dụng giá trị mặc định (5km)
        double effectiveMaxDistance = (maxDistance != null) ? maxDistance : DEFAULT_MAX_DISTANCE_METERS;
        // Nếu limit không được cung cấp, trả về tất cả địa điểm
        int effectiveLimit = (limit != null) ? limit : Integer.MAX_VALUE;

        // Tìm các địa điểm gần
        List<Object[]> nearbyPlaces = placeRepository.findNearbyPlaces(hotelId, effectiveMaxDistance, effectiveLimit);
        List<PlaceDTO> placeDTOs = new ArrayList<>();

        for (Object[] result : nearbyPlaces) {
            Object[] placeData = result;
            Double distanceInMeters = (Double) placeData[10]; // Vị trí mới của distance_in_meters

            // Log để kiểm tra kiểu dữ liệu
            for (int i = 0; i < placeData.length; i++) {
                logger.debug("Column {}: Type = {}, Value = {}", i, (placeData[i] != null ? placeData[i].getClass().getName() : "null"), placeData[i]);
            }

            // Ánh xạ từ Object[] sang Place
            Place place = new Place();
            place.setId(placeData[0] != null ? Integer.valueOf(placeData[0].toString()) : null);
            place.setTitle((String) placeData[1]);
            place.setRating(placeData[2] != null ? Float.parseFloat(placeData[2].toString()) : null);
            place.setAddress((String) placeData[3]);
            place.setReview(placeData[4] != null ? Integer.valueOf(placeData[4].toString()) : null);
            place.setSlug((String) placeData[5]);
            if (placeData[6] != null) {
                try {
                    String coordinatesStr = placeData[6].toString().trim();
                    if (!coordinatesStr.isEmpty()) {
                        GeometryFactory geometryFactory = new GeometryFactory();
                        WKTReader reader = new WKTReader(geometryFactory);
                        Point coordinates = (Point) reader.read(coordinatesStr);
                        place.setCoordinates(coordinates);
                    } else {
                        logger.warn("Empty coordinates for place ID {}", placeData[0]);
                        place.setCoordinates(null);
                    }
                } catch (Exception e) {
                    logger.error("Failed to parse coordinates for place ID {}: {}", placeData[0], e.getMessage());
                    place.setCoordinates(null);
                }
            }
            place.setImageUrl((String) placeData[7]);
            place.setDescription((String) placeData[8]);
            if (placeData[9] != null) {
                try {
                    String servicesStr = placeData[9].toString().trim();
                    if (!servicesStr.isEmpty()) {
                        List<Map<String, List<String>>> services = objectMapper.readValue(
                                servicesStr, new TypeReference<List<Map<String, List<String>>>>() {});
                        place.setServices(services);
                    } else {
                        logger.warn("Empty services for place ID {}", placeData[0]);
                        place.setServices(null);
                    }
                } catch (Exception e) {
                    logger.error("Failed to parse services for place ID {}: {}", placeData[0], e.getMessage());
                    place.setServices(null);
                }
            }

            // Chuyển đổi Place sang PlaceDTO
            PlaceDTO placeDTO = toPlaceDTO(place);
            placeDTO.setDistanceInMeters(distanceInMeters != null ? distanceInMeters : 0.0); // Gán giá trị mặc định nếu null

            placeDTOs.add(placeDTO);
        }

        logger.info("Found {} nearby places for hotel ID: {}", placeDTOs.size(), hotelId);
        return placeDTOs;
    }
    @Transactional(readOnly = true)
    public List<HotelDTO> findNearbyHotels(Integer placeId, Double maxDistance, Integer limit) {
        logger.info("Finding nearby hotels for place ID: {}", placeId);

        // Kiểm tra xem địa điểm có tồn tại không
        Optional<Place> placeOpt = placeRepository.findById(placeId);
        if (placeOpt.isEmpty()) {
            logger.warn("Place not found for ID: {}", placeId);
            throw new RuntimeException("Place not found with ID: " + placeId);
        }

        // Nếu maxDistance không được cung cấp, sử dụng giá trị mặc định (5km)
        double effectiveMaxDistance = (maxDistance != null) ? maxDistance : DEFAULT_MAX_DISTANCE_METERS;
        // Nếu limit không được cung cấp, trả về tất cả khách sạn
        int effectiveLimit = (limit != null) ? limit : Integer.MAX_VALUE;

        // Tìm các khách sạn gần
        List<Object[]> nearbyHotels = hotelRepository.findNearbyHotels(placeId, effectiveMaxDistance, effectiveLimit);
        List<HotelDTO> hotelDTOs = new ArrayList<>();

        for (Object[] result : nearbyHotels) {
            Object[] hotelData = result;
            Double distanceInMeters = (Double) hotelData[14]; // Vị trí của distance_in_meters

            // Log để kiểm tra kiểu dữ liệu
            for (int i = 0; i < hotelData.length; i++) {
                logger.debug("Column {}: Type = {}, Value = {}", i, (hotelData[i] != null ? hotelData[i].getClass().getName() : "null"), hotelData[i]);
            }

            // Ánh xạ từ Object[] sang Hotel
            Hotel hotel = new Hotel();
            hotel.setId(hotelData[0] != null ? Integer.valueOf(hotelData[0].toString()) : null);
            hotel.setName((String) hotelData[1]);
            hotel.setAddress((String) hotelData[2]);
            hotel.setDistrict((String) hotelData[3]);
            hotel.setDescription((String) hotelData[4]);
            hotel.setHotelLink((String) hotelData[5]);
            hotel.setRatingStars(hotelData[6] != null ? Integer.valueOf(hotelData[6].toString()) : null);
            if (hotelData[7] != null) {
                try {
                    String facilitiesStr = hotelData[7].toString().trim();
                    if (!facilitiesStr.isEmpty()) {
                        List<String> facilities = objectMapper.readValue(facilitiesStr, new TypeReference<List<String>>() {});
                        hotel.setFacilities(facilities);
                    } else {
                        logger.warn("Empty facilities for hotel ID {}", hotelData[0]);
                        hotel.setFacilities(null);
                    }
                } catch (Exception e) {
                    logger.error("Failed to parse facilities for hotel ID {}: {}", hotelData[0], e.getMessage());
                    hotel.setFacilities(null);
                }
            }
            if (hotelData[8] != null) {
                try {
                    String highlightsStr = hotelData[8].toString().trim();
                    if (!highlightsStr.isEmpty()) {
                        Map<String, List<String>> highlights = objectMapper.readValue(highlightsStr, new TypeReference<Map<String, List<String>>>() {});
                        hotel.setHighlights(highlights);
                    } else {
                        logger.warn("Empty highlights for hotel ID {}", hotelData[0]);
                        hotel.setHighlights(null);
                    }
                } catch (Exception e) {
                    logger.error("Failed to parse highlights for hotel ID {}: {}", hotelData[0], e.getMessage());
                    hotel.setHighlights(null);
                }
            }
            if (hotelData[9] != null) {
                try {
                    String reviewsStr = hotelData[9].toString().trim();
                    if (!reviewsStr.isEmpty()) {
                        Map<String, Double> reviews = objectMapper.readValue(reviewsStr, new TypeReference<Map<String, Double>>() {});
                        hotel.setReviews(reviews);
                    } else {
                        logger.warn("Empty reviews for hotel ID {}", hotelData[0]);
                        hotel.setReviews(null);
                    }
                } catch (Exception e) {
                    logger.error("Failed to parse reviews for hotel ID {}: {}", hotelData[0], e.getMessage());
                    hotel.setReviews(null);
                }
            }
            if (hotelData[10] != null) {
                try {
                    String imageUrlsStr = hotelData[10].toString().trim();
                    if (!imageUrlsStr.isEmpty()) {
                        List<String> imageUrls = objectMapper.readValue(imageUrlsStr, new TypeReference<List<String>>() {});
                        hotel.setImageUrls(imageUrls);
                    } else {
                        logger.warn("Empty imageUrls for hotel ID {}", hotelData[0]);
                        hotel.setImageUrls(null);
                    }
                } catch (Exception e) {
                    logger.error("Failed to parse imageUrls for hotel ID {}: {}", hotelData[0], e.getMessage());
                    hotel.setImageUrls(null);
                }
            }
            if (hotelData[11] != null) {
                try {
                    String roomServicesStr = hotelData[11].toString().trim();
                    if (!roomServicesStr.isEmpty()) {
                        Map<String, List<String>> roomServices = objectMapper.readValue(roomServicesStr, new TypeReference<Map<String, List<String>>>() {});
                        hotel.setRoomServices(roomServices);
                    } else {
                        logger.warn("Empty roomServices for hotel ID {}", hotelData[0]);
                        hotel.setRoomServices(null);
                    }
                } catch (Exception e) {
                    logger.error("Failed to parse roomServices for hotel ID {}: {}", hotelData[0], e.getMessage());
                    hotel.setRoomServices(null);
                }
            }
            hotel.setSlug((String) hotelData[12]);

            // Xử lý tọa độ từ cột coordinates (WKT)
            if (hotelData[13] != null) {
                try {
                    String coordinatesStr = hotelData[13].toString().trim();
                    if (!coordinatesStr.isEmpty()) {
                        GeometryFactory geometryFactory = new GeometryFactory();
                        WKTReader reader = new WKTReader(geometryFactory);
                        Point coordinates = (Point) reader.read(coordinatesStr);
                        hotel.setCoordinates(coordinates);
                    } else {
                        logger.warn("Empty coordinates for hotel ID {}", hotelData[0]);
                        hotel.setCoordinates(null);
                    }
                } catch (Exception e) {
                    logger.error("Failed to parse coordinates for hotel ID {}: {}", hotelData[0], e.getMessage());
                    hotel.setCoordinates(null);
                }
            }

            // Chuyển đổi Hotel sang HotelDTO
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
            // Ánh xạ latitude và longitude từ coordinates
            if (hotel.getCoordinates() != null) {
                hotelDTO.setLatitude(hotel.getCoordinates().getY());
                hotelDTO.setLongitude(hotel.getCoordinates().getX());
            } else {
                hotelDTO.setLatitude(null);
                hotelDTO.setLongitude(null);
            }
            hotelDTO.setDistanceInMeters(distanceInMeters != null ? distanceInMeters : 0.0);

            hotelDTOs.add(hotelDTO);
        }

        logger.info("Found {} nearby hotels for place ID: {}", hotelDTOs.size(), placeId);
        return hotelDTOs;
    }

    @Transactional(readOnly = true)
    public List<HotelSearchResponse> searchHotelsByPriceGuestsAndDistrict(Integer maxPrice, Integer numberOfGuests, String district) {
        logger.info("Searching hotels with maxPrice: {}, numberOfGuests: {}, district: {}", maxPrice, numberOfGuests, district);

        // Kiểm tra xem có ít nhất một tiêu chí được cung cấp không
        if (maxPrice == null && numberOfGuests == null && district == null) {
            throw new IllegalArgumentException("At least one search criterion (maxPrice, numberOfGuests, or district) must be provided");
        }

        // Kiểm tra giá trị hợp lệ nếu các trường được cung cấp
        if (maxPrice != null && maxPrice <= 0) {
            throw new IllegalArgumentException("maxPrice must be a positive value");
        }
        if (numberOfGuests != null && numberOfGuests <= 0) {
            throw new IllegalArgumentException("numberOfGuests must be a positive value");
        }
        List<String> validDistricts = Arrays.asList("Liên Chiểu", "Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Cẩm Lệ");
        if (district != null && !district.isEmpty() && !validDistricts.contains(district)) {
            throw new IllegalArgumentException("District must be one of: " + validDistricts);
        }

        // Tìm các phòng thỏa mãn maxPrice và numberOfGuests (nếu có)
        List<RoomType> matchingRooms;
        if (maxPrice != null && numberOfGuests != null) {
            matchingRooms = roomRepository.findByPriceAndGuests(Double.valueOf(maxPrice), numberOfGuests);
        } else if (maxPrice != null) {
            matchingRooms = roomRepository.findByPrice(Double.valueOf(maxPrice));
        } else if (numberOfGuests != null) {
            matchingRooms = roomRepository.findByGuests(numberOfGuests);
        } else {
            // Nếu không có maxPrice và numberOfGuests, lấy tất cả phòng
            matchingRooms = roomRepository.findAll();
        }

        if (matchingRooms.isEmpty()) {
            logger.info("No rooms found matching the criteria: maxPrice = {}, numberOfGuests = {}", maxPrice, numberOfGuests);
            return List.of();
        }

        // Gom nhóm phòng theo hotelId
        Map<Integer, List<RoomType>> roomsByHotel = new HashMap<>();
        for (RoomType room : matchingRooms) {
            Integer hotelId = room.getHotel().getId();
            roomsByHotel.computeIfAbsent(hotelId, k -> new ArrayList<>()).add(room);
        }

        // Lấy danh sách hotelId
        List<Integer> hotelIds = new ArrayList<>(roomsByHotel.keySet());

        // Tìm khách sạn theo hotelIds và district (nếu có)
        List<Hotel> hotels;
        if (district != null && !district.isEmpty()) {
            hotels = hotelRepository.findAllByIdAndDistrict(hotelIds, district);
        } else {
            hotels = hotelRepository.findAllById(hotelIds);
        }

        if (hotels.isEmpty()) {
            logger.warn("No hotels found for the matching rooms and district: {}", district);
            return List.of();
        }

        // Tạo danh sách phản hồi
        List<HotelSearchResponse> responses = new ArrayList<>();
        for (Hotel hotel : hotels) {
            HotelSearchResponse response = new HotelSearchResponse();
            response.setHotel(toHotelDTO(hotel));

            // thêm logic trả về room và place nếu cần
            List<RoomType> hotelRooms = roomsByHotel.get(hotel.getId());
            List<RoomDTO> roomDTOs = hotelRooms.stream()
                    .map(this::toRoomDTO)
                    .collect(Collectors.toList());
            response.setRooms(roomDTOs);
//            response.setPlaces(List.of());

            responses.add(response);
        }

        logger.info("Found {} hotels with matching rooms in district: {}", responses.size(), district);
        return responses;
    }

    private void saveSearchHistory(String query, User user) {
        try {
            SearchHistory history = new SearchHistory(user, query);
            searchHistoryRepository.save(history);
            logger.info("Search history saved for user: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("Failed to save search history for user {}: {}", user.getEmail(), e.getMessage());
            // Không ném lỗi để không ảnh hưởng đến quá trình tìm kiếm
        }
    }

    private float[] getQueryEmbedding(String query) {
        try {
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("query", query);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    EMBEDDING_API_URL,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Double> embeddingList = (List<Double>) response.getBody().get("embedding");
                if (embeddingList.size() != 768) {
                    throw new RuntimeException("Invalid embedding dimension: " + embeddingList.size());
                }
                float[] embedding = new float[embeddingList.size()];
                for (int i = 0; i < embeddingList.size(); i++) {
                    embedding[i] = embeddingList.get(i).floatValue();
                }
                return embedding;
            } else {
                throw new RuntimeException("Failed to get embedding from API: " + response.getStatusCode());
            }
        } catch (Exception e) {
            logger.error("Error calling embedding API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get query embedding", e);
        }
    }


//    private double calculateCosineSimilarity(float[] vectorA, float[] vectorB) {
//        if (vectorA.length != vectorB.length) {
//            throw new IllegalArgumentException("Vectors must have the same length");
//        }
//
//        double dotProduct = 0.0;
//        double normA = 0.0;
//        double normB = 0.0;
//
//        for (int i = 0; i < vectorA.length; i++) {
//            dotProduct += vectorA[i] * vectorB[i];
//            normA += vectorA[i] * vectorA[i];
//            normB += vectorB[i] * vectorB[i];
//        }
//
//        normA = Math.sqrt(normA);
//        normB = Math.sqrt(normB);
//
//        if (normA == 0 || normB == 0) {
//            return 0.0;
//        }
//
//        return dotProduct / (normA * normB);
//    }

    private String arrayToString(float[] array) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < array.length; i++) {
            sb.append(array[i]);
            if (i < array.length - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    // Phương thức chuyển đổi từ Hotel sang HotelDTO
    private HotelDTO toHotelDTO(Hotel hotel) {
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
    }

    // Phương thức chuyển đổi từ RoomType sang RoomDTO
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

    // Phương thức chuyển đổi từ Place sang PlaceDTO
    private PlaceDTO toPlaceDTO(Place place) {
        PlaceDTO placeDTO = new PlaceDTO();
        placeDTO.setId(place.getId());
        placeDTO.setTitle(place.getTitle());
        placeDTO.setRating(place.getRating());
        placeDTO.setAddress(place.getAddress());
        placeDTO.setReview(place.getReview());
        placeDTO.setSlug(place.getSlug());
        placeDTO.setLatitude(place.getCoordinates() != null ? place.getCoordinates().getY() : null);
        placeDTO.setLongitude(place.getCoordinates() != null ? place.getCoordinates().getX() : null);
        placeDTO.setImageUrl(place.getImageUrl());
        placeDTO.setDescription(place.getDescription());
        placeDTO.setServices(place.getServices());
        return placeDTO;
    }
}