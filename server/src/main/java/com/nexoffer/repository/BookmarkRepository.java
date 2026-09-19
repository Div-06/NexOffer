package com.nexoffer.repository;

import com.nexoffer.model.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    List<Bookmark> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Bookmark> findByUserIdAndCategoryOrderByCreatedAtDesc(Long userId, String category);
    Optional<Bookmark> findByUserIdAndQuestion(Long userId, String question);
    Optional<Bookmark> findByIdAndUserId(Long id, Long userId);
}
