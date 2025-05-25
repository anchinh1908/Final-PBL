package com.example.AI.Hotel.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.postgresql.util.PGobject;

@Converter(autoApply = false)
public class StringVectorConverter implements AttributeConverter<String, Object> {

//    @Override
//    public Object convertToDatabaseColumn(String attribute) {
//        if (attribute == null || attribute.isEmpty()) {
//            return null;
//        }
//        try {
//            // Kiểm tra định dạng của chuỗi
//            if (!attribute.matches("^\\s*\\[.*\\]\\s*$")) {
//                throw new IllegalArgumentException("Invalid vector format: must be enclosed in square brackets, got: " + attribute);
//            }
//            // Tạo PGobject để lưu vào cột vector
//            PGobject pgObject = new PGobject();
//            pgObject.setType("vector");
//            pgObject.setValue(attribute);
//            return pgObject;
//        } catch (Exception e) {
//            throw new IllegalArgumentException("Error converting String to vector: " + e.getMessage(), e);
//        }
//    }
//
//    @Override
//    public String convertToEntityAttribute(Object dbData) {
//        if (dbData == null) {
//            return null;
//        }
//        try {
//            if (dbData instanceof PGobject) {
//                String vectorStr = ((PGobject) dbData).getValue();
//                return vectorStr; // Đã có dạng "[0.1,0.2,...,0.3]"
//            } else if (dbData instanceof String) {
//                return (String) dbData;
//            } else {
//                throw new IllegalArgumentException("Expected PGobject or String but got " + dbData.getClass().getName());
//            }
//        } catch (Exception e) {
//            throw new IllegalArgumentException("Error converting vector to String: " + e.getMessage(), e);
//        }
//    }

    @Override
    public Object convertToDatabaseColumn(String attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return null;
        }
        try {
            // Kiểm tra định dạng của chuỗi
            if (!attribute.matches("^\\s*\\[.*\\]\\s*$")) {
                throw new IllegalArgumentException("Invalid vector format: must be enclosed in square brackets, got: " + attribute);
            }
            // Chuỗi đã có định dạng "[1.0,2.0,...]", có thể dùng trực tiếp
            // Tạo PGobject để lưu vào cột vector
            PGobject pgObject = new PGobject();
            pgObject.setType("vector");
            pgObject.setValue(attribute);
            return pgObject;
        } catch (Exception e) {
            throw new IllegalArgumentException("Error converting String to vector: " + e.getMessage(), e);
        }
    }

    @Override
    public String convertToEntityAttribute(Object dbData) {
        if (dbData == null) {
            return null;
        }
        try {
            // Xử lý kiểu PGobject từ pgvector
            if (dbData instanceof PGobject) {
                String vectorStr = ((PGobject) dbData).getValue();
                return vectorStr; // Đã có dạng "[0.1,0.2,...,0.3]"
            } else if (dbData instanceof String) {
                return (String) dbData; // Nếu đã ép kiểu embedding::text trước đó
            } else {
                throw new IllegalArgumentException("Expected PGobject or String but got " + dbData.getClass().getName());
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Error converting vector to String: " + e.getMessage(), e);
        }
    }
}