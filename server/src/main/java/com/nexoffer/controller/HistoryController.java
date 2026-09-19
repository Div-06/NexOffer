package com.nexoffer.controller;

import com.nexoffer.model.History;
import com.nexoffer.model.User;
import com.nexoffer.repository.HistoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final HistoryRepository historyRepository;

    public HistoryController(HistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    @GetMapping
    public ResponseEntity<?> getHistory(@AuthenticationPrincipal User user) {
        List<History> list = historyRepository.findTop50ByUserIdOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "count", list.size(),
                "history", list
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHistoryItem(@AuthenticationPrincipal User user, @PathVariable Long id) {
        Optional<History> itemOpt = historyRepository.findByIdAndUserId(id, user.getId());
        if (itemOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "History item not found."));
        }

        historyRepository.delete(itemOpt.get());
        return ResponseEntity.ok(Map.of("success", true, "message", "History item removed."));
    }

    @DeleteMapping
    public ResponseEntity<?> clearHistory(@AuthenticationPrincipal User user) {
        historyRepository.deleteByUserId(user.getId());
        return ResponseEntity.ok(Map.of("success", true, "message", "All preparation history cleared."));
    }
}
