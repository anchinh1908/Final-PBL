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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

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
    public PlaceTrip addPlaceTrip(Integer placeId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

        if (user.isDeleted()) {
            logger.warn("User {} attempted to add hotel but account is disabled", user.getId());
            throw new SecurityException("Tài khoản đã bị vô hiệu hóa");
        }

        PlaceTrip placeTrip = new PlaceTrip();
        logger.info("UserID: {}", user.getId());
        placeTrip.setUserId(user.getId());
        placeTrip.setPlaceId(placeId);

        PlaceTrip savedPlaceTrip = placeTripRepository.save(placeTrip);
        logger.info("User {} added hotel {} to trip", user.getId(), placeId);
        return savedPlaceTrip;
    }


//    @Transactional
//    public HotelTrip addHotelTrip(Integer userId, Integer hotelId) {
//        // Kiểm tra user tồn tại và không bị vô hiệu hóa
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
//        logger.info("userID "+ userId);
//
//        if (user.isDeleted()) {
//            logger.warn("User {} attempted to add hotel but account is disabled", userId);
//            throw new SecurityException("Account is disabled");
//        }
//
//        // Tạo bản ghi HotelTrip
//        HotelTrip hotelTrip = new HotelTrip();
//        logger.info( " userid" + userId);
//        hotelTrip.setUserId(userId);
//        logger.info( " userid" + userId);
//        hotelTrip.setHotelId(hotelId);
//
//        HotelTrip savedHotelTrip = hotelTripRepository.save(hotelTrip);
//        logger.info("User {} added hotel {} to trip", userId, hotelId);
//        return savedHotelTrip;
//    }
    @Transactional
    public HotelTrip addHotelTrip(Integer hotelId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

        if (user.isDeleted()) {
            logger.warn("User {} attempted to add hotel but account is disabled", user.getId());
            throw new SecurityException("Tài khoản đã bị vô hiệu hóa");
        }

        HotelTrip hotelTrip = new HotelTrip();
        logger.info("UserID: {}", user.getId());
        hotelTrip.setUserId(user.getId());
        hotelTrip.setHotelId(hotelId);

        HotelTrip savedHotelTrip = hotelTripRepository.save(hotelTrip);
        logger.info("User {} added hotel {} to trip", user.getId(), hotelId);
        return savedHotelTrip;
    }

//    @Transactional
//    public void deleteHotelTrip(Integer userId, Integer hotelTripId) {
//        // Tìm bản ghi và kiểm tra quyền
//        HotelTrip hotelTrip = hotelTripRepository.findByIdAndUserId(hotelTripId, userId)
//                .orElseThrow(() -> new IllegalArgumentException("HotelTrip not found or you do not have permission to delete"));
//        logger.info("User {} deleted hotel {} from trip", userId, hotelTripId);
//        hotelTripRepository.delete(hotelTrip);
//        logger.info("User {} deleted hotel trip with ID {}", userId, hotelTripId);
//    }

//    @Transactional
//    public void deletePlaceTrip(Integer userId, Integer placeTripId) {
//        // Tìm bản ghi và kiểm tra quyền
//        PlaceTrip placeTrip = placeTripRepository.findByIdAndUserId(placeTripId, userId)
//                .orElseThrow(() -> new IllegalArgumentException("PlaceTrip not found or you do not have permission to delete"));
//
//        logger.info("User {} deleted place trip with ID {}", userId, placeTripId);
//        placeTripRepository.delete(placeTrip);
//        logger.info("User {} deleted place trip with ID {}", userId, placeTripId);
//    }

    @Transactional
    public void deletePlaceTrip(Integer placeId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));
        Integer userId = user.getId();

        List<PlaceTrip> placeTrips = placeTripRepository.findAllByUserIdAndPlaceId(userId, placeId);
        if (placeTrips.isEmpty()) {
            logger.warn("No PlaceTrip found for user {} with placeId {}", userId, placeId);
            throw new IllegalArgumentException("PlaceTrip not found or you do not have permission to delete");
        }

        logger.info("User {} deleted place trips with placeId {}", userId, placeId);
        placeTripRepository.deleteAll(placeTrips); // Xóa cứng
        logger.info("User {} deleted place trips with placeId {}", userId, placeId);
    }
    @Transactional
    public void deleteHotelTrip(Integer hotelId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));
        Integer userId = user.getId();

        List<HotelTrip> hotelTrips = hotelTripRepository.findAllByUserIdAndPlaceId(userId, hotelId);
        if (hotelTrips.isEmpty()) {
            logger.warn("No HotelTrip found for user {} with placeId {}", userId, hotelId);
            throw new IllegalArgumentException("PlaceTrip not found or you do not have permission to delete");
        }

        logger.info("User {} deleted place trips with placeId {}", userId, hotelId);
        hotelTripRepository.deleteAll(hotelTrips); // Xóa cứng
        logger.info("User {} deleted place trips with placeId {}", userId, hotelId);
    }
}
