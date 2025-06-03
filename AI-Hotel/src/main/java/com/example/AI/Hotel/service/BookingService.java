package com.example.AI.Hotel.service;

import com.example.AI.Hotel.dto.BookingRequest;
import com.example.AI.Hotel.model.RoomType;
import com.example.AI.Hotel.model.User;
import com.example.AI.Hotel.repository.RoomRepository;
import com.example.AI.Hotel.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class BookingService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MailService mailService;

    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy");

    @Transactional
    public Map<String, Object> bookRoom(Integer userId, BookingRequest request) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Kiểm tra room
        RoomType room = roomRepository.findAvailableRoomById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Phòng không còn trống"));

        // Cập nhật trạng thái phòng
        room.setStatus(RoomType.Status.BOOKED);
        roomRepository.save(room);

        // Lấy thời gian hệ thống làm bookingTime
        LocalDateTime bookingTime = LocalDateTime.now();
        String formattedBookingTime = bookingTime.format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss"));

        // Định dạng ngày theo pattern "dd-MM-yyyy"
        String formattedCheckInDate = request.getCheckInDate().format(DATE_FORMATTER);
        String formattedCheckOutDate = request.getCheckOutDate().format(DATE_FORMATTER);

        Map<String, String> userPlaceholders = new HashMap<>();
        userPlaceholders.put("FULL_NAME", user.getFullName());
        userPlaceholders.put("HOTEL_NAME", room.getHotel().getName());
        userPlaceholders.put("ROOM_NAME", room.getName());
        userPlaceholders.put("CHECK_IN_DATE", formattedCheckInDate);
        userPlaceholders.put("CHECK_OUT_DATE", formattedCheckOutDate);
        userPlaceholders.put("BOOKING_TIME", formattedBookingTime);

        Map<String, String> hotelPlaceholders = new HashMap<>();
        hotelPlaceholders.put("HOTEL_NAME", room.getHotel().getName());
        hotelPlaceholders.put("USER_NAME", user.getFullName());
        hotelPlaceholders.put("ROOM_NAME", room.getName());
        hotelPlaceholders.put("CHECK_IN_DATE", formattedCheckInDate);
        hotelPlaceholders.put("CHECK_OUT_DATE", formattedCheckOutDate);
        hotelPlaceholders.put("BOOKING_TIME", formattedBookingTime);

        // Gửi email thông báo tới user
        try {
            mailService.sendBookingConfirmation(user.getEmail(), userPlaceholders);
        } catch (Exception e) {
            logger.error("Failed to send booking confirmation email to user: {}", user.getEmail(), e);
        }

        // Gửi email thông báo tới khách sạn
//        try {
//            String hotelEmail = room.getHotel().getEmail();
//            if (!StringUtils.hasText(hotelEmail)) {
//                logger.warn("Hotel email not configured for hotel: {}", room.getHotel().getName());
//            } else {
//                mailService.sendHotelNotification(hotelEmail, hotelPlaceholders);
//            }
//        } catch (Exception e) {
//            logger.error("Failed to send booking notification email to hotel: {}", room.getHotel().getName(), e);
//        }

        response.put("status", "200");
        response.put("message", "Phòng đã được đặt thành công");
        response.put("roomId", room.getId());
        return response;
    }

//    @Transactional
//    public Map<String, Object> bookRoom(Integer userId, BookingRequest request) {
//        Map<String, Object> response = new HashMap<>();
//
//        // Kiểm tra user
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
//
//        // Kiểm tra room
//        RoomType room = roomRepository.findAvailableRoomById(request.getRoomId())
//                .orElseThrow(() -> new RuntimeException("Phòng không còn trống"));
//
//        // Cập nhật trạng thái phòng
//        room.setStatus(RoomType.Status.BOOKED);
//        roomRepository.save(room);
//
//        // Chuẩn bị thông tin gửi email
//        LocalDateTime bookingTime = request.getBookingTime() != null ? request.getBookingTime() : LocalDateTime.now();
//        String formattedBookingTime = bookingTime.format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss"));
//
//        // Định dạng ngày theo pattern "dd-MM-yyyy"
//        String formattedCheckInDate = request.getCheckInDate().format(DATE_FORMATTER);
//        String formattedCheckOutDate = request.getCheckOutDate().format(DATE_FORMATTER);
//
//        Map<String, String> userPlaceholders = new HashMap<>();
//        userPlaceholders.put("FULL_NAME", user.getFullName());
//        userPlaceholders.put("HOTEL_NAME", room.getHotel().getName());
//        userPlaceholders.put("ROOM_NAME", room.getName());
//        userPlaceholders.put("CHECK_IN_DATE", formattedCheckInDate);
//        userPlaceholders.put("CHECK_OUT_DATE", formattedCheckOutDate);
//        userPlaceholders.put("BOOKING_TIME", formattedBookingTime);
//
//        Map<String, String> hotelPlaceholders = new HashMap<>();
//        hotelPlaceholders.put("HOTEL_NAME", room.getHotel().getName());
//        hotelPlaceholders.put("USER_NAME", user.getFullName());
//        hotelPlaceholders.put("ROOM_NAME", room.getName());
//        userPlaceholders.put("CHECK_IN_DATE", formattedCheckInDate); // Định dạng mới
////        userPlaceholders.put("CHECK_OUT_DATE", formattedCheckOutDate); // Định dạng mới
//        hotelPlaceholders.put("BOOKING_TIME", formattedBookingTime);
//
//        // Gửi email thông báo tới user
//        try {
//            mailService.sendBookingConfirmation(user.getEmail(), userPlaceholders);
//        } catch (Exception e) {
//            logger.error("Failed to send booking confirmation email to user: {}", user.getEmail(), e);
//        }
//
//        // Gửi email thông báo tới khách sạn
////        try {
////            String hotelEmail = room.getHotel().getEmail();
////            if (!StringUtils.hasText(hotelEmail)) {
////                logger.warn("Hotel email not configured for hotel: {}", room.getHotel().getName());
////            } else {
////                mailService.sendHotelNotification(hotelEmail, hotelPlaceholders);
////            }
////        } catch (Exception e) {
////            logger.error("Failed to send booking notification email to hotel: {}", room.getHotel().getName(), e);
////        }
//
//        response.put("status", "200");
//        response.put("message", "Phòng đã được đặt thành công");
//        response.put("roomId", room.getId());
//        return response;
//    }
}
