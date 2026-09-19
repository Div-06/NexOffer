package com.nexoffer.repository;

import com.nexoffer.model.History;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HistoryRepository extends JpaRepository<History, Long> {
    List<History> findTop50ByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<History> findByIdAndUserId(Long id, Long userId);
    void deleteByUserId(Long userId);
}
