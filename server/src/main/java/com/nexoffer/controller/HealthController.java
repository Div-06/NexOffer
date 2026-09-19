package com.nexoffer.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "message", "NexOffer Java Spring Boot API is running smoothly.",
                "version", "1.0.0",
                "tagline", "Your Next Offer Starts Here.",
                "stack", "Java 21, Spring Boot 3, PostgreSQL, Spring Data JPA, JWT, Gemini API",
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}
