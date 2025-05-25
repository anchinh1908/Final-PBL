package com.example.AI.Hotel.service;

import com.example.AI.Hotel.model.HotelEmbedding;
import com.example.AI.Hotel.model.PlaceEmbedding;
import com.example.AI.Hotel.repository.HotelEmbeddingRepository;
import com.example.AI.Hotel.repository.PlaceEmbeddingRepository;
import com.example.AI.Hotel.util.VectorTranslator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
public class EmbeddingService {

    private static final Logger logger = LoggerFactory.getLogger(EmbeddingService.class);
    private final HotelEmbeddingRepository hotelEmbeddingRepository;
    private final PlaceEmbeddingRepository placeEmbeddingRepository;
    private final VectorTranslator vectorTranslator;

    @Autowired
    public EmbeddingService(
            HotelEmbeddingRepository hotelEmbeddingRepository,
            PlaceEmbeddingRepository placeEmbeddingRepository,
            VectorTranslator vectorTranslator) {
        this.hotelEmbeddingRepository = hotelEmbeddingRepository;
        this.placeEmbeddingRepository = placeEmbeddingRepository;
        this.vectorTranslator = vectorTranslator;
    }

    public void validateEmbeddings() {
        try {
            List<HotelEmbedding> hotelEmbeddings = hotelEmbeddingRepository.findAllWithHotelId();
            logger.info("Found {} hotel embeddings", hotelEmbeddings.size());
            for (HotelEmbedding embedding : hotelEmbeddings) {
                String embeddingStr = embedding.getEmbedding();
                if (embeddingStr == null || embeddingStr.isEmpty()) {
                    logger.warn("Invalid hotel embedding (null or empty) for hotel ID: {}", embedding.getId());
                    continue;
                }
                try {
                    float[] vector = vectorTranslator.translate(embeddingStr);
                    if (vector.length != 768) {
                        logger.warn("Invalid hotel embedding dimension for hotel ID: {}, got dimension: {}", embedding.getId(), vector.length);
                    }
                } catch (IllegalArgumentException e) {
                    logger.warn("Error translating hotel embedding for hotel ID: {}: {}", embedding.getId(), e.getMessage());
                }
            }
        } catch (Exception e) {
            logger.error("Error validating hotel embeddings: {}", e.getMessage(), e);
        }

        try {
            List<PlaceEmbedding> placeEmbeddings = placeEmbeddingRepository.findAllWithPlaceId();
            logger.info("Found {} place embeddings", placeEmbeddings.size());
            for (PlaceEmbedding embedding : placeEmbeddings) {
                String embeddingStr = embedding.getEmbedding();
                if (embeddingStr == null || embeddingStr.isEmpty()) {
                    logger.warn("Invalid place embedding (null or empty) for place ID: {}", embedding.getId());
                    continue;
                }
                try {
                    float[] vector = vectorTranslator.translate(embeddingStr);
                    if (vector.length != 768) {
                        logger.warn("Invalid place embedding dimension for place ID: {}, got dimension: {}", embedding.getId(), vector.length);
                    }
                } catch (IllegalArgumentException e) {
                    logger.warn("Error translating place embedding for place ID: {}: {}", embedding.getId(), e.getMessage());
                }
            }
        } catch (Exception e) {
            logger.error("Error validating place embeddings: {}", e.getMessage(), e);
        }
    }
}