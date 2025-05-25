package com.example.AI.Hotel.controller;

import com.example.AI.Hotel.config.JwtUtil;
import com.example.AI.Hotel.dto.*;
import com.example.AI.Hotel.model.User;
import com.example.AI.Hotel.repository.UserRepository;
import com.example.AI.Hotel.service.MailService;
import com.example.AI.Hotel.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private MailService mailService;
    @Autowired
    private UserService userService;

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    // trả về key-value: message
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        Map<String, Object> response = new HashMap<>();

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            response.put("message", "Email đã tồn tại ");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setAddress(request.getAddress());
        user.setRole(User.Role.USER);
        userRepository.save(user);

        response.put("message", "Người dùng đăng kí tài khoản thành công " );
        response.put("status", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
    // gửi otp
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        Map<String, Object> response = new HashMap<>();

        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            response.put("message", "Email not found");
            response.put("status", HttpStatus.NOT_FOUND.value());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        User user = userOptional.get();

        // Sinh và gửi mã OTP
        String otp = mailService.sendOtp(user.getEmail());
        user.setResetToken(otp); // Lưu OTP vào resetToken
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(10)); // OTP hết hạn sau 10 phút
        userRepository.save(user);

        response.put("message", "OTP has been sent to your email");
        response.put("status", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        Map<String, Object> response = new HashMap<>();

        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            response.put("message", "Email không tồn tại");
            response.put("status", HttpStatus.NOT_FOUND.value());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        userOptional = userRepository.findByResetToken(request.getOtp());
        if (userOptional.isEmpty()) {
            response.put("message", "OTP không phù hợp hoặc đã hết hạn");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        User user = userOptional.get();
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            response.put("message", "OTP đã hết hạn");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

//        user.setEmail(user.getEmail());
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        response.put("message", "Mật khẩu cập nhật thành công");
        response.put("status", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalStateException("User not found"));

            // Kiểm tra trạng thái isDeleted
            if (user.isDeleted()) {
                response.put("status", HttpStatus.UNAUTHORIZED.value());
                response.put("message", "Tài khoản đã bị vô hiệu hóa");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            String token = jwtUtil.generateToken(email, user.getRole().name());

            response.put("status", HttpStatus.OK.value());
            response.put("message", "Đăng nhập thành công");
            response.put("token", token);
            return ResponseEntity.ok(response);

        } catch (Exception ex) {
            response.put("status", HttpStatus.UNAUTHORIZED.value());
            response.put("message", "Email hoặc mật khẩu không hợp lệ");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

//    @GetMapping("oauth2/success")
//    public ResponseEntity<Map<String, Object>> oauth2LoginSuccess(@AuthenticationPrincipal OAuth2User principal) {
//        Map<String, Object> response = new HashMap<>();
//
//        // Kiểm tra principal
//        if (principal == null) {
//            logger.error("OAuth2 principal is null");
//            response.put("message", "Đăng nhập thất bại");
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
//        }
//        logger.info("Google principal attributes: {}", principal.getAttributes());
//
//        // Lấy thông tin từ Google
//        String googleId = principal.getAttribute("sub");
//        String email = principal.getAttribute("email");
//        String name = principal.getAttribute("name");
//        String picture = principal.getAttribute("picture");
//
//        // Kiểm tra thông tin bắt buộc
//        if (googleId == null || email == null) {
//            logger.error("Missing required attributes: googleId={}, email={}", googleId, email);
//            response.put("message", "Thiếu thông tin người dùng cần thiết (googleId hoặc email)");
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//
//        try {
//            // Tìm hoặc tạo người dùng
//            User user = userRepository.findByGoogleId(googleId).orElseGet(() -> {
//                User newUser = new User();
//                newUser.setEmail(email); // email = "anchinh794@gmail.com"
//                newUser.setFullName(name != null ? name : "Unknown");
//                newUser.setAvatarUrl(picture);
//                newUser.setGoogleId(googleId);
//                newUser.setRole(User.Role.USER);
////                newUser.setIsDeleted(false);
//                return userRepository.save(newUser);
//            });
//
//            // Tạo JWT
////            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
//            String token = jwtUtil.generateToken(email, user.getRole().name());
//            logger.info("Generated JWT for user: {}", email);
//
//            response.put("token", token);
//            response.put("message", "Đăng nhập bằng Google thành công");
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            logger.error("Error during OAuth2 login for email {}: {}", email, e.getMessage());
//            response.put("message", "Login failed: " + e.getMessage());
//            response.put("status", HttpStatus.UNAUTHORIZED.value());
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
//        }
//    }

    @GetMapping("/oauth2/success")
    public void oauth2LoginSuccess(@AuthenticationPrincipal OAuth2User principal, HttpServletResponse response) throws Exception {
        // Kiểm tra principal
        if (principal == null) {
            logger.error("OAuth2 principal is null");
            String errorMessage = URLEncoder.encode("Đăng nhập thất bại", StandardCharsets.UTF_8);
            response.sendRedirect("http://localhost:5173/callback?status=false&message=" + errorMessage);
            return;
        }
        logger.info("Google principal attributes: {}", principal.getAttributes());

        // Lấy thông tin từ Google
        String googleId = principal.getAttribute("sub");
        String email = principal.getAttribute("email");
        String name = principal.getAttribute("name");
        String picture = principal.getAttribute("picture");

        // Kiểm tra thông tin bắt buộc
        if (googleId == null || email == null) {
            logger.error("Missing required attributes: googleId={}, email={}", googleId, email);
            String errorMessage = URLEncoder.encode("Thiếu thông tin người dùng cần thiết (googleId hoặc email)", StandardCharsets.UTF_8);
            response.sendRedirect("http://localhost:5173/callback?status=false&message=" + errorMessage);
            return;
        }

        try {
            // Tìm hoặc tạo người dùng
            User user = userRepository.findByGoogleId(googleId).orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setFullName(name != null ? name : "Unknown");
                newUser.setAvatarUrl(picture);
                newUser.setGoogleId(googleId);
                newUser.setRole(User.Role.USER);
                return userRepository.save(newUser);
            });

            // Tạo JWT
            String token = jwtUtil.generateToken(email, user.getRole().name());
            logger.info("Generated JWT for user: {}", email);

            // Mã hóa message và token để an toàn trong URL
            String encodedMessage = URLEncoder.encode("Đăng nhập bằng Google thành công", StandardCharsets.UTF_8);
            String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);

            // Redirect với query parameters
            response.sendRedirect("http://localhost:5173/callback?status=true&token=" + encodedToken + "&message=" + encodedMessage);

        } catch (Exception e) {
            logger.error("Error during OAuth2 login for email {}: {}", email, e.getMessage());
            String errorMessage = URLEncoder.encode("Đăng nhập thất bại: " + e.getMessage(), StandardCharsets.UTF_8);
            response.sendRedirect("http://localhost:5173/callback?status=false&message=" + errorMessage);
        }
    }
    @GetMapping("oauth2/failure")
    public ResponseEntity<Map<String, Object>> oauth2LoginFailure() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Đăng nhập bằng Google thất bại");
        response.put("status", HttpStatus.UNAUTHORIZED.value());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }
}
