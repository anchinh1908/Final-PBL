package com.example.AI.Hotel.service;

import com.example.AI.Hotel.dto.HotelDTO;
import com.example.AI.Hotel.dto.HotelSearchResponse;
import com.example.AI.Hotel.dto.PlaceDTO;
import com.example.AI.Hotel.dto.RoomDTO;
import com.example.AI.Hotel.model.*;
import com.example.AI.Hotel.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HotelDataService {
    private static final Logger logger = LoggerFactory.getLogger(HotelDataService.class);

    private final HotelTripRepository hotelTripRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final PlaceRepository placeRepository;
    private final PlaceTripRepository placeTripRepository;

    @Autowired
    public HotelDataService(
            HotelTripRepository hotelTripRepository, HotelRepository hotelRepository,
            RoomRepository roomRepository,
            PlaceRepository placeRepository,
            PlaceTripRepository placeTripRepository) {
        this.hotelTripRepository = hotelTripRepository;
        this.hotelRepository = hotelRepository;
        this.roomRepository = roomRepository;
        this.placeRepository = placeRepository;
        this.placeTripRepository = placeTripRepository;
    }
    @Transactional(readOnly = true)
    public Page<HotelSearchResponse> getAllHotels(int page, int size) {
        logger.info("Fetching hotels with pagination - page: {}, size: {}", page, size);
        try {
            Pageable pageable = PageRequest.of(page - 1, size);
            Page<Hotel> hotelsPage = hotelRepository.findAll(pageable);
            logger.info("Found {} hotels in page {}", hotelsPage.getTotalElements(), page);

            if (hotelsPage.isEmpty()) {
                logger.warn("No hotels found for page: {}", page);
                return Page.empty(pageable);
            }

            List<HotelSearchResponse> responses = hotelsPage.getContent().stream()
                    .map(this::mapToHotelSearchResponse)
                    .collect(Collectors.toList());
            return new PageImpl<>(responses, pageable, hotelsPage.getTotalElements());

        } catch (Exception e) {
            logger.error("Error fetching hotels for page: {}, size: {}", page, size, e);
            throw new RuntimeException("Error fetching hotels: " + e.getMessage(), e);
        }
    }
//    @Transactional(readOnly = true)
//    public Map<String, Integer> getNumbersCounts() {
//        try {
//            long totalHotels = hotelRepository.count();
//            long totalPlaces = placeRepository.count();
//            long totalRooms = roomRepository.count();
////            logger.info("Total number of hotels counted: {}", totalHotels);
//            return (Map<String, Integer>) Collections.singletonList("Total Hotel" + totalHotels + "Total Places" + totalPlaces + "Total Room" +  totalRooms);
//        } catch (Exception e) {
//            logger.error("Error counting total hotels: {}", e.getMessage(), e);
//            throw new RuntimeException("Error counting hotels: " + e.getMessage(), e);
//        }
//    }
    @Transactional(readOnly = true)
    public Map<String, Long> getNumbersCounts() {
        try {
            long totalHotels = hotelRepository.count();
            long totalPlaces = placeRepository.count();
            long totalRooms = roomRepository.count();
            logger.info("Total number of hotels: {}, places: {}, rooms: {}", totalHotels, totalPlaces, totalRooms);

            Map<String, Long> totals = new HashMap<>();
            totals.put("Total Hotel", totalHotels);
            totals.put("Total Places", totalPlaces);
            totals.put("Total Room", totalRooms);
            return totals;
        } catch (Exception e) {
            logger.error("Error counting total hotels: {}", e.getMessage(), e);
            throw new RuntimeException("Error counting hotels: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public Page<RoomDTO> getAllRooms(int page, int size) {
        logger.info("Fetching rooms with pagination - page: {}, size: {}", page, size);
        try {
            Pageable pageable = PageRequest.of(page - 1, size);
            Page<RoomType> roomsPage = roomRepository.findAll(pageable);
            logger.info("Found {} rooms in page {}", roomsPage.getTotalElements(), page);

            if (roomsPage.isEmpty()) {
                logger.warn("No rooms found for page: {}", page);
                return Page.empty(pageable);
            }

            List<RoomDTO> roomDTOs = roomsPage.getContent().stream()
                    .map(this::mapToRoomDTO)
                    .collect(Collectors.toList());
            return new PageImpl<>(roomDTOs, pageable, roomsPage.getTotalElements());

        } catch (Exception e) {
            logger.error("Error fetching rooms for page: {}, size: {}", page, size, e);
            throw new RuntimeException("Error fetching rooms: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public Page<PlaceDTO> getAllPlaces(int page, int size) {
        logger.info("Fetching places with pagination - page: {}, size: {}", page, size);
        try {
            Pageable pageable = PageRequest.of(page - 1, size);
            Page<Place> placesPage = placeRepository.findAll(pageable);
            logger.info("Found {} places in page {}", placesPage.getTotalElements(), page);

            if (placesPage.isEmpty()) {
                logger.warn("No places found for page: {}", page);
                return Page.empty(pageable);
            }

            List<PlaceDTO> placeDTOs = placesPage.getContent().stream()
                    .map(this::mapToPlaceDTO)
                    .collect(Collectors.toList());
            return new PageImpl<>(placeDTOs, pageable, placesPage.getTotalElements());

        } catch (Exception e) {
            logger.error("Error fetching places for page: {}, size: {}", page, size, e);
            throw new RuntimeException("Error fetching places: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public HotelSearchResponse getHotelById(Integer id) {
        logger.info("Fetching hotel with id: {}", id);
        try {
            Optional<Hotel> hotelOpt = hotelRepository.findById(id);
            if (hotelOpt.isEmpty()) {
                logger.warn("Hotel not found for id: {}", id);
                throw new RuntimeException("Hotel not found with id: " + id);
            }

            Hotel hotel = hotelOpt.get();
            return mapToHotelSearchResponse(hotel);

        } catch (Exception e) {
            logger.error("Error fetching hotel with id: {}", id, e);
            throw new RuntimeException("Error fetching hotel: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public HotelSearchResponse findHotelBySlug(String slug) {
        logger.info("Fetching hotel with slug: {}", slug);
        try {
            Optional<Hotel> hotelOptional = hotelRepository.findBySlug(slug);
            if (hotelOptional.isEmpty()) {
                logger.warn("Hotel not found for slug: {}", slug);
                throw new RuntimeException("Hotel not found with id: " + slug);
            }

            Hotel hotel = hotelOptional.get();
            return mapToHotelSearchResponse(hotel);

        } catch (Exception e) {
            logger.error("Error fetching hotel with slug: {}", slug, e);
            throw new RuntimeException("Error fetching hotel: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public RoomDTO getRoomById(Integer id) {
        logger.info("Fetching room with id: {}", id);
        try {
            Optional<RoomType> roomOpt = roomRepository.findById(id);
            if (roomOpt.isEmpty()) {
                logger.warn("Room not found for id: {}", id);
                throw new RuntimeException("Room not found with id: " + id);
            }

            RoomType room = roomOpt.get();
            return mapToRoomDTO(room);

        } catch (Exception e) {
            logger.error("Error fetching room with id: {}", id, e);
            throw new RuntimeException("Error fetching room: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public PlaceDTO getPlaceById(Integer id) {
        logger.info("Fetching place with id: {}", id);
        try {
            Optional<Place> placeOpt = placeRepository.findById(id);
            if (placeOpt.isEmpty()) {
                logger.warn("Place not found for id: {}", id);
                throw new RuntimeException("Place not found with id: " + id);
            }

            Place place = placeOpt.get();
            return mapToPlaceDTO(place);

        } catch (Exception e) {
            logger.error("Error fetching place with id: {}", id, e);
            throw new RuntimeException("Error fetching place: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public PlaceDTO getPlaceBySlug(String slug) {
        logger.info("Fetching place with slug: {}", slug);
        try {
            Optional<Place> placeOpt = placeRepository.findBySlug(slug);
            if (placeOpt.isEmpty()) {
                logger.warn("Place not found for slug: {}", slug);
                throw new RuntimeException("Place not found with id: " + slug);
            }

            Place place = placeOpt.get();
            return mapToPlaceDTO(place);

        } catch (Exception e) {
            logger.error("Error fetching place with slug: {}", slug, e);
            throw new RuntimeException("Error fetching place: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<HotelSearchResponse> getTop5HotelsByReviews() {
        logger.info("Fetching top 5 hotels by reviews");
        try {
            // Lấy tất cả khách sạn từ repository
            List<Hotel> allHotels = hotelRepository.findAll();
            if (allHotels.isEmpty()) {
                logger.warn("No hotels found in the database");
                return Collections.emptyList();
            }

            // Sắp xếp khách sạn theo điểm review trung bình giảm dần và lấy top 5
            List<HotelSearchResponse> topHotels = allHotels.stream()
                    .filter(hotel -> hotel.getReviews() != null && !hotel.getReviews().isEmpty()) // Bỏ qua khách sạn không có review
                    .sorted(Comparator.comparingDouble(hotel ->
                            -hotel.getReviews().values().stream().mapToDouble(Double::doubleValue).average().orElse(0.0))) // Sắp xếp giảm dần theo điểm trung bình
                    .limit(10) // Lấy top 5
                    .map(this::mapToHotelSearchResponse) // Ánh xạ sang HotelSearchResponse
                    .collect(Collectors.toList());

            logger.info("Successfully fetched top 5 hotels by reviews, count: {}", topHotels.size());
            return topHotels;

        } catch (Exception e) {
            logger.error("Error fetching top 5 hotels by reviews", e);
            throw new RuntimeException("Error fetching top 5 hotels by reviews: " + e.getMessage(), e);
        }
    }

    private String extractDistrictFromAddress(String address) {
        if (address == null || address.trim().isEmpty()) {
            return null;
        }

        List<String> daNangDistricts = List.of("Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu", "Cẩm Lệ", "Hòa Vang");
        String[] parts = address.split(",");
        if (parts.length < 3) {
            return null;
        }

        String potentialDistrict = parts[2].trim();
        return daNangDistricts.contains(potentialDistrict) ? potentialDistrict : null;
    }

    @Transactional(readOnly = true)
    public List<HotelSearchResponse> getHotelTripsByUser(Integer userId) {
        logger.info("Fetching hotel trips for user: {}", userId);
        try {
            List<HotelTrip> hotelTrips = hotelTripRepository.findByUserId(userId);
            if (hotelTrips.isEmpty()) {
                logger.warn("No hotel trips found for user: {}", userId);
                return List.of();
            }

            return hotelTrips.stream()
                    .map(HotelTrip::getHotel)
                    .filter(hotel -> hotel != null)
                    .map(this::mapToHotelSearchResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error fetching hotel trips for user: {}", userId, e);
            throw new RuntimeException("Error fetching hotel trips: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<PlaceDTO> getPlaceTripsByUser(Integer userId) {
        logger.info("Fetching hotel trips for user: {}", userId);
        try {
            List<PlaceTrip> placeTrips = placeTripRepository.findByUserId(userId);
            if (placeTrips.isEmpty()) {
                logger.warn("No place trips found for user: {}", userId);
                return List.of();
            }

            return placeTrips.stream()
                    .map(PlaceTrip::getPlace)
                    .filter(place -> place != null)
                    .map(this::mapToPlaceDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error fetching place trips for user: {}", userId, e);
            throw new RuntimeException("Error fetching place trips: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public Page<HotelSearchResponse> getHotelTripsByUser(Integer userId, int page, int size) {
        logger.info("Fetching hotel trips for user: {}, page: {}, size: {}", userId, page, size);
        try {
            Pageable pageable = PageRequest.of(page - 1, size);
            Page<HotelTrip> hotelTripsPage = hotelTripRepository.findByUserId(userId, pageable);

            if (hotelTripsPage.isEmpty()) {
                logger.warn("No hotel trips found for user: {}, page: {}", userId, page);
                return Page.empty(pageable);
            }

            List<HotelSearchResponse> hotelResponses = hotelTripsPage.getContent().stream()
                    .map(HotelTrip::getHotel)
                    .filter(hotel -> hotel != null)
                    .map(this::mapToHotelSearchResponse)
                    .collect(Collectors.toList());

            return new PageImpl<>(hotelResponses, pageable, hotelTripsPage.getTotalElements());
        } catch (Exception e) {
            logger.error("Error fetching hotel trips for user: {}, page: {}, size: {}", userId, page, size, e);
            throw new RuntimeException("Error fetching hotel trips: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public Page<PlaceDTO> getPlacesByDistrict(String district, int page, int size) {
        logger.info("Fetching places by district: {}, page: {}, size: {}", district, page, size);
        try {
            if (district == null || district.trim().isEmpty()) {
                logger.warn("District is null or empty, returning empty page");
                return Page.empty();
            }

            Pageable pageable = PageRequest.of(page - 1, size);
            Page<Place> placesPage = placeRepository.findByDistrict(district.trim(), pageable);

            if (placesPage.isEmpty()) {
                logger.warn("No places found for district: {}, page: {}", district, page);
                return Page.empty(pageable);
            }

            List<PlaceDTO> placeDTOs = placesPage.getContent().stream()
                    .map(this::mapToPlaceDTO)
                    .collect(Collectors.toList());

            return new PageImpl<>(placeDTOs, pageable, placesPage.getTotalElements());
        } catch (Exception e) {
            logger.error("Error fetching places by district: {}, page: {}, size: {}", district, page, size, e);
            throw new RuntimeException("Error fetching places by district: " + e.getMessage(), e);
        }
    }
    @Transactional(readOnly = true)
    public Page<HotelSearchResponse> filterHotels(
            int page, int size, List<String> filterFacilities, boolean matchAll,
            int minPrice, int maxPrice, Integer numberOfGuests, Integer ratingStars) {
        Pageable pageable = PageRequest.of(page - 1, size);

        // Chuẩn hóa danh sách filterFacilities
        List<String> normalizedFilterFacilities = (filterFacilities == null || filterFacilities.isEmpty())
                ? List.of()
                : filterFacilities.stream()
                .map(this::normalizeString)
                .filter(s -> !s.isEmpty())
                .toList();
        logger.info("Normalized filter facilities: {}", normalizedFilterFacilities);

        // Chuyển normalizedFilterFacilities thành chuỗi, phân tách bằng dấu phẩy
        String normalizedFacilitiesStr = String.join(",", normalizedFilterFacilities);
        logger.info("Normalized facilities string: {}", normalizedFacilitiesStr);

        // Lấy danh sách khách sạn từ database với phân trang, bao gồm lọc facilities
        Page<Hotel> hotelPage = hotelRepository.findByRatingStarsAndFacilities(
                ratingStars,
                filterFacilities,
                normalizedFacilitiesStr, // Truyền chuỗi thay vì List<String>
                (long) normalizedFilterFacilities.size(),
                matchAll,
                pageable);

        // Lấy danh sách hotelId trong trang hiện tại
        List<Integer> hotelIds = hotelPage.getContent().stream()
                .map(Hotel::getId)
                .collect(Collectors.toList());

        // Lấy tất cả phòng cho các khách sạn trong trang hiện tại bằng một truy vấn duy nhất
        List<RoomType> allRoomsForPage = hotelIds.isEmpty()
                ? List.of()
                : roomRepository.findRoomsByHotelIdsAndPriceAndGuests(
                hotelIds, minPrice, maxPrice, numberOfGuests);

        // Nhóm phòng theo hotelId để sử dụng trong lọc và ánh xạ
        Map<Integer, List<RoomType>> roomsByHotelId = allRoomsForPage.stream()
                .collect(Collectors.groupingBy(room -> room.getHotel().getId()));

        List<HotelSearchResponse> hotelResponses = hotelPage.getContent().stream()
                .map(this::mapToHotelDTO)
                .filter(hotelDTO -> {
                    Integer hotelId = hotelDTO.getId();
                    List<RoomType> hotelRooms = roomsByHotelId.getOrDefault(hotelId, List.of());

                    // Kiểm tra priceMatch và numberOfGuestsMatch
                    // nếu mà khách sạn không có th
                    boolean priceMatch = !hotelRooms.isEmpty() && hotelRooms.stream()
                            .filter(room -> room.getPrice() != null)
                            .anyMatch(room -> room.getPrice() >= minPrice && room.getPrice() <= maxPrice);

                    boolean numberOfGuestsMatch = true;
                    if (numberOfGuests != null) {
                        numberOfGuestsMatch = hotelRooms.stream()
                                .filter(room -> room.getNumberOfGuests() != null)
                                .anyMatch(room -> room.getNumberOfGuests().equals(numberOfGuests));
                    }
//                    logger.info("Price match for hotel {}: {}", hotelId, priceMatch);
//                    logger.info("NumberOfGuests match for hotel {}: {}, numberOfGuests: {}", hotelId, numberOfGuestsMatch, numberOfGuests);
//                    logger.info("Rating star match for hotel {}: {}", hotelId, ratingStars != null && hotelDTO.getRatingStars() != null && hotelDTO.getRatingStars().equals(ratingStars));
                    return priceMatch && numberOfGuestsMatch && (ratingStars == null || (hotelDTO.getRatingStars() != null && hotelDTO.getRatingStars().equals(ratingStars)));
                })
                .map(hotelDTO -> {
                    HotelSearchResponse response = new HotelSearchResponse();
                    response.setHotel(hotelDTO);

                    Integer hotelId = hotelDTO.getId();
                    List<RoomDTO> matchingRooms = roomsByHotelId.getOrDefault(hotelId, List.of())
                            .stream()
                            .map(this::mapToRoomDTO)
                            .toList();

                    response.setRooms(matchingRooms);
//                    response.setSimilarityScore(null);
//                    response.setPlaces(null);
                    return response;
                })
                .collect(Collectors.toList());

        return new PageImpl<>(hotelResponses, hotelPage.getPageable(), hotelPage.getTotalElements());
    }

    private String normalizeString(String input) {
        logger.info("Input to normalize: {}", input);
        if (input == null || input.trim().isEmpty()) {
            logger.info("Returning empty string for input: {}", input);
            return "";
        }
        String result = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .trim()
                .toLowerCase();
        logger.info("Normalized result: {}", result);
        return result;
    }

    //Chuẩn hóa chuỗi để so sánh không phân biệt hoa/thường, dấu, hay định dạng Unicode
    // giúp lọc facilities chính xác hơn.
//    private String normalizeString(String input) {
//        logger.info("Input to normalize: {}", input);
//        if (input == null || input.trim().isEmpty()) {
//            logger.info("Returning empty string for input: {}", input);
//            return "";
//        }
//        String result = Normalizer.normalize(input, Normalizer.Form.NFC)
//                .replaceAll("\\p{M}", "")
//                .trim()
//                .toLowerCase();
//        logger.info("Normalized result: {}", result);
//        return result;
//    }


//    @Transactional(readOnly = true)
//    public Page<HotelSearchResponse> filterHotels(
//            int page,
//            int size,
//            List<String> filterFacilities,
//            boolean matchAll,
//            int minPrice,
//            int maxPrice,
//            Integer numberOfGuests,
//            Integer ratingStars) {
//        // Bước 1: Lấy toàn bộ khách sạn từ database
//        List<Hotel> allHotels = hotelRepository.findAll();
//        logger.info("Total hotels fetched: {}", allHotels.size());
//
//        // Bước 2: Lấy toàn bộ phòng từ database
//        List<RoomType> allRooms = roomRepository.findAll();
//        logger.info("Total rooms fetched: {}", allRooms.size());
//
//        // Bước 3: Chuẩn hóa danh sách filterFacilities
//        List<String> normalizedFilterFacilities = (filterFacilities == null || filterFacilities.isEmpty())
//                ? List.of()
//                : filterFacilities.stream()
//                .map(this::normalizeString)
//                .filter(s -> !s.isEmpty())
//                .toList();
//        logger.info("Normalized filter facilities: {}", normalizedFilterFacilities);
//
//        // Bước 4: Lọc khách sạn theo các tiêu chí
//        List<HotelSearchResponse> filteredHotels = allHotels.stream()
//                .map(this::mapToHotelDTO) // Ánh xạ sang HotelDTO
//                .filter(hotelDTO -> hotelDTO.getFacilities() != null) // Loại bỏ khách sạn không có facilities
//                .filter(hotelDTO -> {
//                    // Lọc theo facilities
//                    boolean facilitiesMatch = true;
//                    if (!normalizedFilterFacilities.isEmpty()) {
//                        List<String> normalizedHotelFacilities = hotelDTO.getFacilities().stream()
//                                .map(this::normalizeString)
//                                .filter(s -> !s.isEmpty())
//                                .toList();
//
//                        logger.info("Normalized hotel facilities for hotel {}: {}", hotelDTO.getId(), normalizedHotelFacilities);
//
//                        if (matchAll) {
//                            facilitiesMatch = normalizedFilterFacilities.stream().allMatch
//                                    (filterFac -> normalizedHotelFacilities.contains(filterFac));
//                        } else {
//                            facilitiesMatch = normalizedFilterFacilities.stream().anyMatch(filterFac ->
//                                    normalizedHotelFacilities.contains(filterFac));
//                        }
//                    }
//
//                    // Lọc theo ratingStars
//                    boolean ratingStarsMatch = true;
//                    if (ratingStars != null) {
//                        ratingStarsMatch = hotelDTO.getRatingStars() != null &&
//                                hotelDTO.getRatingStars().equals(ratingStars);
//                    }
//
//                    // Lọc theo giá phòng và số lượng khách
//                    Integer hotelId = hotelDTO.getId();
//                    List<RoomType> hotelRooms = allRooms.stream()
//                            .filter(room -> room.getHotel().getId() != null && room.getHotel().getId().equals(hotelId))
//                            .toList();
//
//                    boolean priceMatch = hotelRooms.isEmpty() || hotelRooms.stream()
//                            .filter(room -> room.getPrice() != null)
//                            .anyMatch(room -> room.getPrice() >= minPrice && room.getPrice() <= maxPrice);
//
//                    boolean numberOfGuestsMatch = true;
//                    if (numberOfGuests != null) {
//                        numberOfGuestsMatch = hotelRooms.stream()
//                                .filter(room -> room.getNumberOfGuests() != null)
//                                .anyMatch(room -> room.getNumberOfGuests() >= numberOfGuests);
//                    }
//
//                    logger.info("Facilities match for hotel {}: {}", hotelId, facilitiesMatch);
//                    logger.info("Price match for hotel {}: {}", hotelId, priceMatch);
//                    logger.info("NumberOfGuests match for hotel {}: {}, numberOfGuests: {}", hotelId, numberOfGuestsMatch, numberOfGuests);
//                    logger.info("Rating star match for hotel {}: {}", hotelId, ratingStarsMatch);
//
//                    return facilitiesMatch && priceMatch && numberOfGuestsMatch && ratingStarsMatch;
//                })
//                .map(hotelDTO -> {
//                    // Tạo HotelSearchResponse
//                    HotelSearchResponse response = new HotelSearchResponse();
//                    response.setHotel(hotelDTO);
//
//                    // Lấy danh sách phòng khớp với tiêu chí
//                    List<RoomDTO> matchingRooms = allRooms.stream()
//                            .filter(room -> room.getHotel().getId() != null && room.getHotel().getId().equals(hotelDTO.getId()))
//                            .filter(room -> room.getPrice() != null)
//                            .filter(room -> room.getPrice() >= minPrice && room.getPrice() <= maxPrice)
//                            .filter(room -> numberOfGuests == null || (room.getNumberOfGuests() != null && room.getNumberOfGuests() >= numberOfGuests))
//                            .map(this::mapToRoomDTO) // Ánh xạ sang RoomDTO
//                            .toList();
//
//                    response.setRooms(matchingRooms);
////                    response.setSimilarityScore(null);
////                    response.setPlaces(null);
//                    return response;
//                })
//                .collect(Collectors.toList());
//
//        // Bước 5: Áp dụng phân trang
//        int start = (page - 1) * size;
//        int end = Math.min(start + size, filteredHotels.size());
//        List<HotelSearchResponse> pagedHotels = start < filteredHotels.size()
//                ? filteredHotels.subList(start, end)
//                : new ArrayList<>();
//        logger.info("Total filtered hotels: {}", filteredHotels.size());
//
//        return new PageImpl<>(pagedHotels, PageRequest.of(page - 1, size), filteredHotels.size());
//    }

    // Ánh xạ thủ công hoặc dùng MapStruct
    private HotelDTO mapToHotelDTO(Hotel hotel) {
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

    private HotelSearchResponse mapToHotelSearchResponse(Hotel hotel) {
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

        HotelSearchResponse response = new HotelSearchResponse();
        response.setHotel(hotelDTO);
        response.setSimilarityScore(null); // Không có similarity score trong trường hợp này
//        response.setRooms(Collections.emptyList()); // Để trống nếu không lấy rooms
//        response.setPlaces(Collections.emptyList()); // Để trống nếu không lấy places
        return response;
    }

    private RoomDTO mapToRoomDTO(RoomType roomType) {
        RoomDTO dto = new RoomDTO();
        dto.setId(roomType.getId());
        dto.setHotelId(roomType.getHotel() != null ? roomType.getHotel().getId() : null);
        dto.setName(roomType.getName());
        dto.setNumberOfGuests(roomType.getNumberOfGuests());
        dto.setPrice(roomType.getPrice());
        dto.setOriginalPrice(roomType.getOriginalPrice());
        dto.setTaxesAndFeesUnderPrice(roomType.getTaxesAndFeesUnderPrice());
        return dto;
    }

    private PlaceDTO mapToPlaceDTO(Place place) {
        PlaceDTO dto = new PlaceDTO();
        dto.setId(place.getId());
        dto.setTitle(place.getTitle());
        dto.setRating(place.getRating());
        dto.setAddress(place.getAddress());
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