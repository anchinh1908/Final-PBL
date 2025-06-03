package com.example.AI.Hotel.controller;

import com.cloudinary.Cloudinary;
import com.example.AI.Hotel.config.JwtUtil;
import com.example.AI.Hotel.dto.*;
import com.example.AI.Hotel.model.User;
import com.example.AI.Hotel.repository.UserRepository;
import com.example.AI.Hotel.service.CloudinaryService;
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
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
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
    private Cloudinary cloudinary;

    @Autowired
    private MailService mailService;

    @Autowired
    private UserService userService;

    @Autowired
    private CloudinaryService cloudinaryService;

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @PostMapping("/register/send-otp")
    public ResponseEntity<Map<String, Object>> sendOtpForRegister(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        String email = request.get("email");

        // Kiểm tra email đã tồn tại
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            response.put("message", "Email đã tồn tại");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        try {
            // Tạo user tạm thời để lưu OTP
            User tempUser = new User();
            tempUser.setEmail(email);
            tempUser.setProvider("TEMP"); // Đánh dấu là user tạm thời, sẽ cập nhật sau
            tempUser.setRole(User.Role.USER);

            // Gửi OTP và lưu vào resetToken
            String otp = mailService.sendOtp(email);
            tempUser.setResetToken(otp);
            tempUser.setResetTokenExpiry(LocalDateTime.now().plusMinutes(10)); // OTP hết hạn sau 10 phút
            userRepository.save(tempUser);

            response.put("message", "OTP đã được gửi đến email của bạn");
            response.put("status", HttpStatus.OK.value());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Không thể gửi OTP: {}", e.getMessage());
            response.put("message", "Không thể gửi OTP: " + e.getMessage());
            response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request, @RequestParam String otp) {
        Map<String, Object> response = new HashMap<>();

        // Tìm user tạm thời theo email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email không tồn tại trong hệ thống"));

        // Kiểm tra nếu user đã được đăng ký chính thức (provider = "LOCAL")
        if ("LOCAL".equals(user.getProvider())) {
            response.put("message", "Email đã tồn tại và đã được đăng ký");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // Kiểm tra OTP và thời gian hết hạn
        if (user.getResetToken() == null || !user.getResetToken().equals(otp)) {
            response.put("message", "Mã OTP không hợp lệ");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            response.put("message", "Mã OTP đã hết hạn");
            response.put("status", HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // Xóa resetToken và resetTokenExpiry sau khi xác thực thành công
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        // Cập nhật thông tin user
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setAddress(request.getAddress());
        user.setRole(User.Role.USER);
        user.setProvider("LOCAL"); // Cập nhật provider thành LOCAL sau khi đăng ký thành công
        userRepository.save(user);

        response.put("message", "Người dùng đăng ký tài khoản thành công");
        response.put("status", HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }

    // trả về key-value: message
//    @PostMapping("/register")
//    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
//        Map<String, Object> response = new HashMap<>();
//
//        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
//            response.put("message", "Email đã tồn tại ");
//            response.put("status", HttpStatus.BAD_REQUEST.value());
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//
//        User user = new User();
//        user.setEmail(request.getEmail());
//        user.setPassword(passwordEncoder.encode(request.getPassword()));
//        user.setFullName(request.getFullName());
//        user.setPhoneNumber(request.getPhoneNumber());
//        user.setDateOfBirth(request.getDateOfBirth());
//        user.setAddress(request.getAddress());
//        user.setRole(User.Role.USER);
//        user.setProvider("LOCAL"); // Gán provider là "LOCAL" cho tài khoản đăng ký thông thường
//        userRepository.save(user);
//
//        response.put("message", "Người dùng đăng kí tài khoản thành công " );
//        response.put("status", HttpStatus.OK.value());
//        return ResponseEntity.ok(response);
//    }
    // gửi otp
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        Map<String, Object> response = new HashMap<>();

        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            response.put("message", "Không tìm thấy email");
            response.put("status", HttpStatus.NOT_FOUND.value());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        User user = userOptional.get();

        // Sinh và gửi mã OTP
        String otp = mailService.sendOtp(user.getEmail());
        user.setResetToken(otp); // Lưu OTP vào resetToken
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(10)); // OTP hết hạn sau 10 phút
        userRepository.save(user);

        response.put("message", "OTP đã được tới mail của bạn");
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

//    @PostMapping("/login")
//    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
//        Map<String, Object> response = new HashMap<>();
//
//        try {
//            Authentication authentication = authenticationManager.authenticate(
//                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
//
//            String email = authentication.getName();
//            User user = userRepository.findByEmail(email)
//                    .orElseThrow(() -> new IllegalStateException("Không tìm thấy người dùng"));
//
//            // Kiểm tra tài khoản có phải đăng ký thông thường không
//            if (!"LOCAL".equals(user.getProvider())) {
//                response.put("status", HttpStatus.UNAUTHORIZED.value());
//                response.put("message", "Tài khoản này được đăng ký qua " + user.getProvider() + ". Vui lòng đăng nhập bằng " + user.getProvider());
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
//            }
//
//            // Kiểm tra trạng thái isDeleted
//            if (user.isDeleted()) {
//                response.put("status", HttpStatus.UNAUTHORIZED.value());
//                response.put("message", "Tài khoản đã bị vô hiệu hóa");
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
//            }
//
//            String token = jwtUtil.generateToken(email, user.getRole().name());
//
//            response.put("status", HttpStatus.OK.value());
//            response.put("message", "Đăng nhập thành công");
//            response.put("token", token);
//            return ResponseEntity.ok(response);
//
//        } catch (Exception ex) {
//            response.put("status", HttpStatus.UNAUTHORIZED.value());
//            response.put("message", "Email hoặc mật khẩu không hợp lệ");
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
//        }
//    }
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Kiểm tra xem email có tồn tại không
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new UsernameNotFoundException("Email không tồn tại"));

            // Kiểm tra tài khoản có phải đăng ký thông thường khôngx
            if (!"LOCAL".equals(user.getProvider())) {
                response.put("status", HttpStatus.UNAUTHORIZED.value());
                response.put("message", "Tài khoản này được đăng ký qua " + user.getProvider() + ". Vui lòng đăng nhập bằng " + user.getProvider());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            // Kiểm tra trạng thái isDeleted
            if (user.isDeleted()) {
                response.put("status", HttpStatus.UNAUTHORIZED.value());
                response.put("message", "Tài khoản đã bị vô hiệu hóa");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            // Xác thực email và mật khẩu
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            String email = authentication.getName();
            String token = jwtUtil.generateToken(email, user.getRole().name());

            response.put("status", HttpStatus.OK.value());
            response.put("message", "Đăng nhập thành công");
            response.put("token", token);
            return ResponseEntity.ok(response);

        } catch (UsernameNotFoundException ex) {
            response.put("status", HttpStatus.UNAUTHORIZED.value());
            response.put("message", "Email không tồn tại");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
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
    public void oauth2LoginSuccess(@AuthenticationPrincipal OAuth2User principal, HttpServletResponse response, Authentication authentication) throws Exception {
        if (principal == null) {
            logger.error("OAuth2 principal is null");
            String errorMessage = URLEncoder.encode("Đăng nhập thất bại", StandardCharsets.UTF_8);
            response.sendRedirect("http://localhost:5173/callback?status=false&message=" + errorMessage);
            return;
        }
        logger.info("OAuth2 principal attributes: {}", principal.getAttributes());

        // Lấy provider từ Authentication
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        String provider = oauthToken.getAuthorizedClientRegistrationId().toUpperCase(); // "google" hoặc "facebook"

        String providerId;
        String email;
        String name;
        String picture = null;

        if ("GOOGLE".equals(provider)) {
            logger.info("Processing Google OAuth2 login");
            providerId = principal.getAttribute("sub");
            email = principal.getAttribute("email");
            name = principal.getAttribute("name");
            picture = principal.getAttribute("picture");
        } else if ("FACEBOOK".equals(provider)) {
            logger.info("Processing Facebook OAuth2 login");
            providerId = principal.getAttribute("id");
            email = principal.getAttribute("email");
            name = principal.getAttribute("name");

//            Object pictureObj = principal.getAttribute("picture");
//            if (pictureObj instanceof Map) {
//                Map<String, Object> pictureData = (Map<String, Object>) pictureObj;
//                Object dataObj = pictureData.get("data");
//                if (dataObj instanceof Map) {
//                    Map<String, Object> dataMap = (Map<String, Object>) dataObj;
//                    Object urlObj = dataMap.get("url");
//                    if (urlObj instanceof String) {
//                        picture = (String) urlObj;
//                    } else {
//                        logger.warn("Picture URL is not a String: {}", urlObj);
//                    }
//                } else {
//                    logger.warn("Picture data is not a Map: {}", dataObj);
//                }
//            } else {
//                logger.warn("Picture attribute is not a Map: {}", pictureObj);
//            }
//        } else {
//            logger.error("Unsupported OAuth2 provider: {}", provider);
//            String errorMessage = URLEncoder.encode("Nhà cung cấp OAuth2 không được hỗ trợ: " + provider, StandardCharsets.UTF_8);
//            response.sendRedirect("http://localhost:5173/callback?status=false&message=" + errorMessage);
//            return;
            Object pictureObj = principal.getAttribute("picture");
            if (pictureObj instanceof Map) {
                Map<String, Object> pictureData = (Map<String, Object>) pictureObj;
                Object dataObj = pictureData.get("data");
                if (dataObj instanceof Map) {
                    Map<String, Object> dataMap = (Map<String, Object>) dataObj;
                    Object urlObj = dataMap.get("url");
                    if (urlObj instanceof String) {
                        String originalPictureUrl = (String) urlObj;
                        picture = cloudinaryService.uploadImageFromUrl(originalPictureUrl, email + "_" + System.currentTimeMillis());
                        if (picture == null) {
                            picture = "https://res.cloudinary.com/your-cloud-name/image/upload/ai-hotel/avatars/default-avatar.jpg";
                        }
                    } else {
                        logger.warn("Picture URL is not a String: {}", urlObj);
                    }
                } else {
                    logger.warn("Picture data is not a Map: {}", dataObj);
                }
            } else {
                logger.warn("Picture attribute is not a Map: {}", pictureObj);
            }
        } else {
            logger.error("Unsupported OAuth2 provider: {}", provider);
            String errorMessage = URLEncoder.encode("Nhà cung cấp OAuth2 không được hỗ trợ: " + provider, StandardCharsets.UTF_8);
            response.sendRedirect("http://localhost:5173/callback?status=false&message=" + errorMessage);
            return;
        }

        if (email == null) {
            logger.error("Missing required attribute: email");
            String errorMessage = URLEncoder.encode("Thiếu email người dùng", StandardCharsets.UTF_8);
            response.sendRedirect("http://localhost:5173/callback?status=false&message=" + errorMessage);
            return;
        }

        try {
            Optional<User> existingUserOpt = userRepository.findByEmail(email);
            User user;

            if (existingUserOpt.isPresent()) {
                user = existingUserOpt.get();
                user.setProvider(provider);
                user.setProviderId(providerId);
                user.setFullName(name != null ? name : user.getFullName());
                user.setAvatarUrl(picture != null ? picture : user.getAvatarUrl());
                user = userRepository.save(user);
                logger.info("Updated existing user with email: {} for provider: {}", email, provider);
            } else {
                user = new User();
                user.setEmail(email);
                user.setFullName(name != null ? name : "Unknown");
                user.setAvatarUrl(picture);
                user.setProvider(provider);
                user.setProviderId(providerId);
                user.setRole(User.Role.USER);
                user = userRepository.save(user);
                logger.info("Created new user with email: {} for provider: {}", email, provider);
            }

            String token = jwtUtil.generateToken(email, user.getRole().name());
            logger.info("Generated JWT for user: {} via {}", email, provider);

            String encodedMessage = URLEncoder.encode("Đăng nhập bằng " + provider + " thành công", StandardCharsets.UTF_8);
            String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);

            response.sendRedirect("http://localhost:5173/callback?status=true&token=" + encodedToken + "&message=" + encodedMessage);

        } catch (Exception e) {
            logger.error("Error during OAuth2 login for email {} via {}: {}", email, provider, e.getMessage());
            String errorMessage = URLEncoder.encode("Đăng nhập thất bại: " + e.getMessage(), StandardCharsets.UTF_8);
            response.sendRedirect("http://localhost:5173/callback?status=false&message=" + errorMessage);
        }
    }

//    @GetMapping("/oauth2/success")
//    public void oauth2LoginSuccessOld(@AuthenticationPrincipal OAuth2User principal, HttpServletResponse response) throws Exception {
//        // Kiểm tra principal
//        if (principal == null) {
//            logger.error("OAuth2 principal is null");
//            String errorMessage = URLEncoder.encode("Đăng nhập thất bại", StandardCharsets.UTF_8);
//            response.sendRedirect("http://localhost:5173/callback?status=false&message=" + errorMessage);
//            return;
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
//            String errorMessage = URLEncoder.encode("Thiếu thông tin người dùng cần thiết (googleId hoặc email)", StandardCharsets.UTF_8);
//            response.sendRedirect("http://localhost:5173/callback?status=false&message=" + errorMessage);
//            return;
//        }
//
//        try {
//            // Tìm hoặc tạo người dùng
//            User user = userRepository.findByGoogleId(googleId).orElseGet(() -> {
//                User newUser = new User();
//                newUser.setEmail(email);
//                newUser.setFullName(name != null ? name : "Unknown");
//                newUser.setAvatarUrl(picture);
//                newUser.setGoogleId(googleId);
//                newUser.setRole(User.Role.USER);
//                return userRepository.save(newUser);
//            });
//
//            // Tạo JWT
//            String token = jwtUtil.generateToken(email, user.getRole().name());
//            logger.info("Generated JWT for user: {}", email);
//
//            // Mã hóa message và token để an toàn trong URL
//            String encodedMessage = URLEncoder.encode("Đăng nhập bằng Google thành công", StandardCharsets.UTF_8);
//            String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);
//
//            // Redirect với query parameters
//            response.sendRedirect("http://localhost:5173/callback?status=true&token=" + encodedToken + "&message=" + encodedMessage);
//
//        } catch (Exception e) {
//            logger.error("Error during OAuth2 login for email {}: {}", email, e.getMessage());
//            String errorMessage = URLEncoder.encode("Đăng nhập thất bại: " + e.getMessage(), StandardCharsets.UTF_8);
//            response.sendRedirect("http://localhost:5173/callback?status=false&message=" + errorMessage);
//        }
//    }

    @GetMapping("oauth2/failure")
    public ResponseEntity<Map<String, Object>> oauth2LoginFailure() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Đăng nhập bằng Google thất bại");
        response.put("status", HttpStatus.UNAUTHORIZED.value());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }
}
