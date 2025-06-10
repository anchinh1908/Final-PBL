package com.example.AI.Hotel.config;

import com.example.AI.Hotel.model.User;
import com.example.AI.Hotel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class CleanupScheduler {

    @Autowired
    private UserRepository userRepository;

    @Scheduled(fixedRate = 600000) // Chạy mỗi 5 phút (300,000 ms)
    public void cleanExpiredTempUsers() {
        LocalDateTime now = LocalDateTime.now();
        List<User> expiredUsers = userRepository.findByResetTokenExpiryBeforeAndProvider(now, "TEMP");
        if (!expiredUsers.isEmpty()) {
            userRepository.deleteAll(expiredUsers);
            System.out.println("Đã xóa " + expiredUsers.size() + " tài khoản tạm hết hạn OTP");
        }
    }
}