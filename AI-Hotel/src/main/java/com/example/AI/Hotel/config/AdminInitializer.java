package com.example.AI.Hotel.config;
import com.example.AI.Hotel.model.User;
import com.example.AI.Hotel.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@gmail.com");
            admin.setPassword(passwordEncoder.encode("admin1234"));
            admin.setFullName("Admin");
            admin.setRole(User.Role.ADMIN);
            admin.setProvider("LOCAL");
//            admin.setDeleted(false);   // Đảm bảo tài khoản không bị đánh dấu xóa
            userRepository.save(admin);
            System.out.println("Default admin account created: admin@example.com");
        }
    }
}
