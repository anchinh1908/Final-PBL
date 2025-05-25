package com.example.AI.Hotel.service;

import com.example.AI.Hotel.model.HotelTrip;
import com.example.AI.Hotel.model.PlaceTrip;
import com.example.AI.Hotel.model.User;
import com.example.AI.Hotel.repository.HotelTripRepository;
import com.example.AI.Hotel.repository.PlaceTripRepository;
import com.example.AI.Hotel.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TripService {

    private static final Logger logger = LoggerFactory.getLogger(TripService.class);

    private final PlaceTripRepository placeTripRepository;
    private final HotelTripRepository hotelTripRepository;
    private final UserRepository userRepository;

    @Autowired
    public TripService(PlaceTripRepository placeTripRepository,
                       HotelTripRepository hotelTripRepository,
                       UserRepository userRepository) {
        this.placeTripRepository = placeTripRepository;
        this.hotelTripRepository = hotelTripRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public PlaceTrip addPlaceTrip(Integer userId, Integer placeId) {
        // Kiểm tra user tồn tại và không bị vô hiệu hóa
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        if (user.isDeleted()) {
            logger.warn("User {} attempted to add place but account is disabled", userId);
            throw new SecurityException("Account is disabled");
        }

        // Tạo bản ghi PlaceTrip
        PlaceTrip placeTrip = new PlaceTrip();
        placeTrip.setUserId(userId);
        placeTrip.setPlaceId(placeId);

        PlaceTrip savedPlaceTrip = placeTripRepository.save(placeTrip);
        logger.info("User {} added place {} to trip", userId, placeId);
        return savedPlaceTrip;
    }

    @Transactional
    public void deletePlaceTrip(Integer userId, Integer placeTripId) {
        // Tìm bản ghi và kiểm tra quyền
        PlaceTrip placeTrip = placeTripRepository.findByIdAndUserId(placeTripId, userId)
                .orElseThrow(() -> new IllegalArgumentException("PlaceTrip not found or you do not have permission to delete"));

        placeTripRepository.delete(placeTrip);
        logger.info("User {} deleted place trip with ID {}", userId, placeTripId);
    }

    @Transactional
    public HotelTrip addHotelTrip(Integer userId, Integer hotelId) {
        // Kiểm tra user tồn tại và không bị vô hiệu hóa
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        if (user.isDeleted()) {
            logger.warn("User {} attempted to add hotel but account is disabled", userId);
            throw new SecurityException("Account is disabled");
        }

        // Tạo bản ghi HotelTrip
        HotelTrip hotelTrip = new HotelTrip();
        hotelTrip.setUserId(userId);
        hotelTrip.setHotelId(hotelId);

        HotelTrip savedHotelTrip = hotelTripRepository.save(hotelTrip);
        logger.info("User {} added hotel {} to trip", userId, hotelId);
        return savedHotelTrip;
    }

    @Transactional
    public void deleteHotelTrip(Integer userId, Integer hotelTripId) {
        // Tìm bản ghi và kiểm tra quyền
        HotelTrip hotelTrip = hotelTripRepository.findByIdAndUserId(hotelTripId, userId)
                .orElseThrow(() -> new IllegalArgumentException("HotelTrip not found or you do not have permission to delete"));

        hotelTripRepository.delete(hotelTrip);
        logger.info("User {} deleted hotel trip with ID {}", userId, hotelTripId);
    }
}