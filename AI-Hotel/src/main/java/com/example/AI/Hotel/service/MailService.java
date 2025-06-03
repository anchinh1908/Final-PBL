package com.example.AI.Hotel.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Map;

@Service
public class MailService {

    private static final Logger logger = LoggerFactory.getLogger(MailService.class);

    private final ResourceLoader resourceLoader;
    private final String resendApiKey;

    public MailService(ResourceLoader resourceLoader, @Value("${resend.api-key}") String resendApiKey) {
        this.resourceLoader = resourceLoader;
        this.resendApiKey = resendApiKey;
    }

    public String sendOtp(String toEmail) {
        if (!StringUtils.hasText(toEmail) || !toEmail.contains("@")) {
            throw new IllegalArgumentException("Địa chỉ email không đúng");
        }

        Resend resend = new Resend(resendApiKey);
        String randomOtp = generateNum(4);
        String htmlTemplate = loadAndReplaceTemplate(randomOtp);

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from("hotelProposal <hospital@unime.site>")
//                .from("noreply@resend.dev")
                .to(toEmail)
                .subject("Thư gửi mã OTP xác thực từ Website")
                .html(htmlTemplate)
                .build();

        try {
            CreateEmailResponse response = resend.emails().send(params);
            logger.info("OTP email sent successfully to: {}, Response: {}", toEmail, response);
            return randomOtp;
        } catch (ResendException e) {
            logger.error("Failed to send OTP email to: {}", toEmail, e);
            throw new RuntimeException("Không thể gửi được gmail " + e.getMessage(), e);
        }
    }

    private String loadAndReplaceTemplate(String otp) {
        try {
            Resource resource = resourceLoader.getResource("classpath:static/email.html");
            String htmlTemplate = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            if (htmlTemplate.isEmpty()) {
                throw new RuntimeException("Email template is empty");
            }
            return htmlTemplate.replace("{{OTP}}", otp);
        } catch (IOException e) {
            logger.error("Failed to read email template", e);
            throw new RuntimeException("Failed to read email template", e);
        }
    }

    private String generateNum(int digitCount) {
        SecureRandom random = new SecureRandom();
        int minValue = (int) Math.pow(10, digitCount - 1);
        int maxValue = (int) Math.pow(10, digitCount) - 1;
        return String.valueOf(minValue + random.nextInt(maxValue - minValue + 1));
    }

    // Gửi email thông báo đặt phòng thành công cho user
    public void sendBookingConfirmation(String toEmail, Map<String, String> placeholders) {
        String htmlTemplate = loadAndReplaceTemplate("booking-confirmation.html", placeholders);

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from("hotelProposal <hospital@unime.site>")
                .to(toEmail)
                .subject("Xác nhận đặt phòng thành công")
                .html(htmlTemplate)
                .build();

        try {
            Resend resend = new Resend(resendApiKey);
            CreateEmailResponse response = resend.emails().send(params);
            logger.info("Booking confirmation email sent successfully to: {}, Response: {}", toEmail, response);
        } catch (ResendException e) {
            logger.error("Failed to send booking confirmation email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    // Gửi email thông báo cho khách sạn
    public void sendHotelNotification(String toEmail, Map<String, String> placeholders) {
        String htmlTemplate = loadAndReplaceTemplate("hotel-notification.html", placeholders);

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from("hotelProposal <hospital@unime.site>")
                .to(toEmail)
                .subject("Thông báo đặt phòng mới")
                .html(htmlTemplate)
                .build();

        try {
            Resend resend = new Resend(resendApiKey);
            CreateEmailResponse response = resend.emails().send(params);
            logger.info("Hotel notification email sent successfully to: {}, Response: {}", toEmail, response);
        } catch (ResendException e) {
            logger.error("Failed to send hotel notification email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    // Hàm tiện ích để load và thay thế placeholder trong template
    private String loadAndReplaceTemplate(String templateName, Map<String, String> placeholders) {
        try {
            Resource resource = resourceLoader.getResource("classpath:static/" + templateName);
            String htmlTemplate = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            if (htmlTemplate.isEmpty()) {
                throw new RuntimeException("Email template is empty");
            }
            for (Map.Entry<String, String> entry : placeholders.entrySet()) {
                htmlTemplate = htmlTemplate.replace("{{" + entry.getKey() + "}}", entry.getValue());
            }
            return htmlTemplate;
        } catch (IOException e) {
            logger.error("Failed to read email template: {}", templateName, e);
            throw new RuntimeException("Failed to read email template: " + templateName, e);
        }
    }
}