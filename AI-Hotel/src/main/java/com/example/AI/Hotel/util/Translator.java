package com.example.AI.Hotel.util;

public interface Translator<S, T> {
    T translate(S source);
}