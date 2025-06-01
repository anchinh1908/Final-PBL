package com.example.AI.Hotel.config;

import com.example.AI.Hotel.model.User;
import com.example.AI.Hotel.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        logger.info("Loading user with email: {}", email);

        User user = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với email: " + email));

        logger.info("Found user: email={}, provider={}, role={}", user.getEmail(), user.getProvider(), user.getRole());

        // Kiểm tra tài khoản có phải đăng ký thông thường không
//        if (!"LOCAL".equals(user.getProvider())) {
//            logger.warn("User with email {} is registered via OAuth: {}", email, user.getProvider());
//            throw new UsernameNotFoundException("Tài khoản này được đăng ký qua " + user.getProvider() + ". Vui lòng đăng nhập bằng " + user.getProvider());
//        }

        // Kiểm tra tài khoản có phải OAuth hay không
        String password;
        if (user.getProvider() != null && (user.getProvider().equals("GOOGLE") || user.getProvider().equals("FACEBOOK"))) {
            // Tài khoản OAuth không cần mật khẩu
            password = "{noop}";
        } else {
            // Tài khoản đăng nhập truyền thống phải có mật khẩu
            if (user.getPassword() == null) {
                logger.error("User with email {} has no password but is not an OAuth account", email);
                throw new UsernameNotFoundException("Tài khoản không hợp lệ: Thiếu mật khẩu");
            }
            password = user.getPassword();
        }

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(password)
                .roles(user.getRole().name())
                .build();
    }

}
