package com.example.AI.Hotel.common;

import ai.djl.huggingface.tokenizers.HuggingFaceTokenizer;
import ai.djl.ndarray.NDArray;
import ai.djl.ndarray.NDList;
import ai.djl.ndarray.NDManager;
import ai.djl.translate.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

public class TextEmbeddingTranslator implements Translator<String, float[]> {
    private static final Logger logger = LoggerFactory.getLogger(TextEmbeddingTranslator.class);
    private HuggingFaceTokenizer tokenizer;
    private static final int MAX_LENGTH = 512;

    @Override
    public void prepare(TranslatorContext ctx) throws IOException {
        tokenizer = HuggingFaceTokenizer.newInstance("sentence-transformers/paraphrase-multilingual-mpnet-base-v2");
    }

    @Override
    public NDList processInput(TranslatorContext ctx, String input) throws Exception {
        NDManager manager = ctx.getNDManager();
        if (input == null || input.isEmpty()) {
            throw new IllegalArgumentException("Input text is null or empty");
        }
        if (input.length() > MAX_LENGTH) {
            input = input.substring(0, MAX_LENGTH);
            logger.warn("Input text truncated to {} characters.", MAX_LENGTH);
        }
        var encoded = tokenizer.encode(input);
        NDArray inputIds = manager.create(encoded.getIds()).expandDims(0);
        NDArray attentionMask = manager.create(encoded.getAttentionMask()).expandDims(0);
        return new NDList(inputIds, attentionMask);
    }

    @Override
    public float[] processOutput(TranslatorContext ctx, NDList list) throws Exception {
        if (list == null || list.isEmpty()) {
            throw new IllegalStateException("Model output is null or empty");
        }
        NDArray result = list.get(0);
        if (result.getShape().dimension() == 2) {
            result = result.squeeze(0);
        }
        if (result.getShape().dimension() != 1) {
            throw new IllegalStateException("Unexpected output shape: " + result.getShape());
        }
        return result.toFloatArray();
    }

    @Override
    public Batchifier getBatchifier() {
        return new StackBatchifier();
    }
}