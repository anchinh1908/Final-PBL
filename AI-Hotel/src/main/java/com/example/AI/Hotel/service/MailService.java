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
            throw new IllegalArgumentException("Invalid email address");
        }

        Resend resend = new Resend(resendApiKey);
        String randomOtp = generateNum(4);
        String htmlTemplate = loadAndReplaceTemplate(randomOtp);

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from("hotelProposal <hospital@unime.site>")
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
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
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
}