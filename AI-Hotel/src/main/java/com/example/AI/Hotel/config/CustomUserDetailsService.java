package com.example.AI.Hotel.config;

import com.example.AI.Hotel.model.User;
import com.example.AI.Hotel.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

//    @Override
//    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
//        System.out.println("Loading user with email: " + email);
//        User user = userRepository.findByEmail(email)
//                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
//        System.out.println("Found user: " + user);
//        return org.springframework.security.core.userdetails.User
//                .withUsername(user.getEmail())
//                .password(user.getPassword())
//                .roles(user.getRole().name())
//                .build();
//    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        System.out.println("Loading user with email: " + email);
        User user = userRepository.findByEmailAndIsDeletedFalse(email) // Sử dụng findByEmailAndIsDeletedFalse để đảm bảo tính nhất quán
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với email: " + email));
        System.out.println("Found user: " + user);

        String password = user.getPassword() != null ? user.getPassword() : "{noop}"; // Sử dụng {noop} cho OAuth
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(password)
                .roles(user.getRole().name())
                .build();
    }

}
