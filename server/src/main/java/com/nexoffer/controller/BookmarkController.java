package com.nexoffer.controller;

import com.nexoffer.model.Bookmark;
import com.nexoffer.model.User;
import com.nexoffer.repository.BookmarkRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {

    private final BookmarkRepository bookmarkRepository;

    public BookmarkController(BookmarkRepository bookmarkRepository) {
        this.bookmarkRepository = bookmarkRepository;
    }

    @GetMapping
    public ResponseEntity<?> getBookmarks(@AuthenticationPrincipal User user,
                                          @RequestParam(required = false) String category,
                                          @RequestParam(required = false) String search) {
        List<Bookmark> bookmarks;
        if (category != null && !category.equalsIgnoreCase("All")) {
            bookmarks = bookmarkRepository.findByUserIdAndCategoryOrderByCreatedAtDesc(user.getId(), category);
        } else {
            bookmarks = bookmarkRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        }

        if (search != null && !search.isBlank()) {
            String lower = search.toLowerCase();
            bookmarks = bookmarks.stream()
                    .filter(b -> (b.getQuestion() != null && b.getQuestion().toLowerCase().contains(lower)) ||
                                 (b.getTopic() != null && b.getTopic().toLowerCase().contains(lower)) ||
                                 (b.getNotes() != null && b.getNotes().toLowerCase().contains(lower)))
                    .toList();
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "count", bookmarks.size(),
                "bookmarks", bookmarks
        ));
    }

    @PostMapping
    public ResponseEntity<?> createBookmark(@AuthenticationPrincipal User user, @RequestBody Map<String, Object> body) {
        String question = body.get("question") != null ? body.get("question").toString() : null;
        if (question == null || question.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Question content is required."));
        }

        Optional<Bookmark> existing = bookmarkRepository.findByUserIdAndQuestion(user.getId(), question.trim());
        if (existing.isPresent()) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Question is already in your bookmarks.",
                    "bookmark", existing.get()
            ));
        }

        String category = body.get("category") != null ? body.get("category").toString() : "General";
        String difficulty = body.get("difficulty") != null ? body.get("difficulty").toString() : "Medium";
        String topic = body.get("topic") != null ? body.get("topic").toString() : "";
        String suggestedAnswer = body.get("suggestedAnswer") != null ? body.get("suggestedAnswer").toString() : "";
        String notes = body.get("notes") != null ? body.get("notes").toString() : "";

        Bookmark bookmark = new Bookmark(
                user.getId(),
                question.trim(),
                category,
                difficulty,
                topic,
                suggestedAnswer,
                notes
        );

        Bookmark saved = bookmarkRepository.save(bookmark);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Question saved to bookmarks!",
                "bookmark", saved,
                "data", saved
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBookmark(@AuthenticationPrincipal User user,
                                            @PathVariable Long id,
                                            @RequestBody Map<String, Object> body) {
        Optional<Bookmark> bookmarkOpt = bookmarkRepository.findByIdAndUserId(id, user.getId());
        if (bookmarkOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Bookmark not found."));
        }

        Bookmark bookmark = bookmarkOpt.get();
        if (body.containsKey("notes")) {
            bookmark.setNotes(body.get("notes") != null ? body.get("notes").toString() : "");
        }
        Bookmark saved = bookmarkRepository.save(bookmark);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Bookmark updated successfully!",
                "bookmark", saved
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBookmark(@AuthenticationPrincipal User user, @PathVariable Long id) {
        Optional<Bookmark> bookmarkOpt = bookmarkRepository.findByIdAndUserId(id, user.getId());
        if (bookmarkOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Bookmark not found."));
        }

        bookmarkRepository.delete(bookmarkOpt.get());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Bookmark removed successfully."
        ));
    }
}
