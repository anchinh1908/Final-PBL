package com.example.AI.Hotel;

import com.example.AI.Hotel.service.EmbeddingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling  // dành cho xóa user tạm thời
@SpringBootApplication
public class AiHotelApplication {

	private static final Logger logger = LoggerFactory.getLogger(AiHotelApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(AiHotelApplication.class, args);
		logger.info("AI Hotel Application started successfully!");
	}

	@Bean
	public ObjectMapper objectMapper() {
		ObjectMapper objectMapper = new ObjectMapper();
		objectMapper.registerModule(new JavaTimeModule()); // tạo module cho Java 8 date/time
		return objectMapper;
	}

//	@Bean
//	public CommandLineRunner init(EmbeddingService embeddingService) {
//		return args -> {
//			// Kiểm tra và xác thực các embedding khi ứng dụng khởi động
//			logger.info("Validating hotel and place embeddings...");
//			try {
//				embeddingService.validateEmbeddings();
//				logger.info("Embedding validation completed successfully.");
//			} catch (Exception e) {
//				logger.error("Error during embedding validation: {}", e.getMessage(), e);
//			}
//		};
//	}
}