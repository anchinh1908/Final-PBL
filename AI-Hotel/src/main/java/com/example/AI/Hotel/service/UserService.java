package com.example.AI.Hotel.service;

import com.example.AI.Hotel.dto.UserDTO;
import com.example.AI.Hotel.model.User;
import com.example.AI.Hotel.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDTO findUserByEmail(String email) {
        User user = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không được tìm thấy với email: " + email));

        // Kiểm tra và lọc user không phải ADMIN
        if (user.getRole().equals(User.Role.ADMIN)) {
            throw new RuntimeException("Người dùng không được tìm thấy với email: " + email); // Hoặc thông báo tùy chỉnh
        }

        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setFullName(user.getFullName());
        userDTO.setPhoneNumber(user.getPhoneNumber());
        userDTO.setDateOfBirth(user.getDateOfBirth());
        userDTO.setAddress(user.getAddress());
        userDTO.setAvatarUrl(user.getAvatarUrl());
        userDTO.setDeleted(user.isDeleted());
        return userDTO;
    }

    @Transactional
    public void updatePassword(String email, String oldPassword, String newPassword) {
        // Lấy thông tin user hiện tại
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        // Kiểm tra tài khoản không bị vô hiệu hóa
        if (user.isDeleted()) {
            logger.warn("User {} attempted to update password but account is disabled", email);
            throw new SecurityException("Account is disabled");
        }

        // Kiểm tra mật khẩu cũ
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            logger.warn("User {} entered incorrect old password", email);
            throw new SecurityException("Old password is incorrect");
        }

        // Kiểm tra mật khẩu mới không trùng với mật khẩu cũ
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            logger.warn("User {} attempted to set new password same as old password", email);
            throw new IllegalArgumentException("New password must be different from old password");
        }

        // Mã hóa mật khẩu mới
        String encodedNewPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedNewPassword);

        // Lưu thay đổi
        userRepository.save(user);
        logger.info("User {} updated password successfully", email);
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> getAllUser(int page, int size) {
        try {
            Pageable pageable = PageRequest.of(page - 1, size);
            Page<User> usersPage = userRepository.findAll(pageable);
            logger.info("Found {} places in page {}", usersPage.getTotalElements(), page);

            if (usersPage.isEmpty()) {
                logger.warn("No users found for page: {}", page);
                return Page.empty(pageable);
            }

            List<UserDTO> userDTOs = usersPage.getContent().stream()
                    .filter(user -> !user.getRole().equals(User.Role.ADMIN))
                    .map(this::mapToUserDTO)
                    .collect(Collectors.toList());
            return new PageImpl<>(userDTOs, pageable, usersPage.getTotalElements());

        } catch (Exception e) {
            logger.error("Error fetching places for page: {}, size: {}", page, size, e);
            throw new RuntimeException("Error fetching places: " + e.getMessage(), e);
        }
    }

    public UserDTO getUserProfile(String email) {
        User user = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng"));

        if (user.getRole().equals(User.Role.ADMIN)) {
            throw new UsernameNotFoundException("Không tìm thấy người dùng");
        }

        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setFullName(user.getFullName());
        userDTO.setPhoneNumber(user.getPhoneNumber());
        userDTO.setDateOfBirth(user.getDateOfBirth());
        userDTO.setAddress(user.getAddress());
        userDTO.setAvatarUrl(user.getAvatarUrl());
        userDTO.setDeleted(user.isDeleted());
        return userDTO;
    }

    @Transactional(readOnly = true)
    public UserDTO getUserById(Integer id) {
        logger.info("Fetching room with id: {}", id);
        try {
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isEmpty()) {
                logger.warn("User not found for id: {}", id);
                throw new RuntimeException("Room not found with id: " + id);
            }

            User user = userOpt.get();
            return mapToUserDTO(user);

        } catch (Exception e) {
            logger.error("Error fetching room with id: {}", id, e);
            throw new RuntimeException("Error fetching room: " + e.getMessage(), e);
        }
    }


    private UserDTO mapToUserDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setFullName(user.getFullName());
        userDTO.setPhoneNumber(user.getPhoneNumber());
        userDTO.setDateOfBirth(user.getDateOfBirth());
        userDTO.setAddress(user.getAddress());
        userDTO.setAvatarUrl(user.getAvatarUrl());
        user.setDeleted(user.isDeleted());
        return userDTO;
    }
}
