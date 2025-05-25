package com.example.AI.Hotel.util;

import org.springframework.stereotype.Component;

@Component
public class VectorTranslator implements Translator<String, float[]> {
    @Override
    public float[] translate(String source) {
        if (source == null || source.isEmpty()) {
            return new float[768];
        }
        // Kiểm tra định dạng cơ bản
        if (!source.matches("^\\s*\\[.*\\]\\s*$")) {
            throw new IllegalArgumentException("Invalid vector format: must be enclosed in square brackets, got: " + source);
        }
        try {
            String cleaned = source.trim().replaceAll("[\\[\\]]", "");
            if (cleaned.isEmpty()) {
                throw new IllegalArgumentException("Vector string is empty after removing brackets");
            }
            String[] parts = cleaned.split(",");
            float[] vector = new float[parts.length];
            for (int i = 0; i < parts.length; i++) {
                vector[i] = Float.parseFloat(parts[i].trim());
            }
            if (vector.length != 768) {
                throw new IllegalArgumentException("Vector dimension must be 768, got " + vector.length);
            }
            return vector;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Error translating String to float[]: " + e.getMessage(), e);
        }
    }
}