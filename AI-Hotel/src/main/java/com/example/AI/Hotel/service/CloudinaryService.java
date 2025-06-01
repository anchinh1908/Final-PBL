package com.example.AI.Hotel.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    private static final Logger logger = LoggerFactory.getLogger(CloudinaryService.class);

    public Map<String, Object> fetchImageFromUrl(String imageUrl) throws IOException {
        try {
            URL url = new URL(imageUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("HEAD");
            String contentType = connection.getContentType();
            int contentLength = connection.getContentLength();

            // Tải ảnh về dạng byte[]
            try (InputStream inputStream = url.openStream()) {
                byte[] imageBytes = inputStream.readAllBytes();
                Map<String, Object> result = new HashMap<>();
                result.put("bytes", imageBytes);
                result.put("contentType", contentType);
                result.put("size", imageBytes.length);
                return result;
            }
        } catch (IOException e) {
            logger.error("Failed to fetch image from URL {}: {}", imageUrl, e.getMessage());
            throw e;
        }
    }

    public String uploadImageFromUrl(String imageUrl, String publicId) {
        try {
            Map<String, Object> uploadResult = cloudinary.uploader().upload(imageUrl, ObjectUtils.asMap(
                    "resource_type", "image",
                    "public_id", "ai-hotel/avatars/" + publicId
            ));
            String secureUrl = (String) uploadResult.get("secure_url");
            logger.info("Uploaded image to Cloudinary: {}", secureUrl);
            return secureUrl;
        } catch (Exception e) {
            logger.error("Failed to upload image to Cloudinary from URL {}: {}", imageUrl, e.getMessage());
            return null;
        }
    }

    public String uploadImage(byte[] imageBytes, String publicId) throws IOException {
        try {
            Map<String, Object> uploadResult = cloudinary.uploader().upload(imageBytes, ObjectUtils.asMap(
                    "resource_type", "image",
                    "public_id", "ai-hotel/avatars/" + publicId
            ));
            String secureUrl = (String) uploadResult.get("secure_url");
            logger.info("Uploaded image to Cloudinary: {}", secureUrl);
            return secureUrl;
        } catch (Exception e) {
            logger.error("Failed to upload image to Cloudinary: {}", e.getMessage());
            throw new IOException("Failed to upload image to Cloudinary", e);
        }
    }

    public void deleteImage(String publicId) throws IOException {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            logger.info("Deleted image from Cloudinary with publicId: {}", publicId);
        } catch (Exception e) {
            logger.error("Failed to delete image from Cloudinary with publicId {}: {}", publicId, e.getMessage());
        }
    }

    public String extractPublicId(String url) {
        // Ví dụ URL: https://res.cloudinary.com/your-cloud-name/image/upload/ai-hotel/avatars/xyz.jpg
        String[] parts = url.split("/");
        String publicIdWithExtension = parts[parts.length - 1]; // xyz.jpg
        return "ai-hotel/avatars/" + publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf(".")); // ai-hotel/avatars/xyz
    }
}
