package com.tecnocampus.LS2.protube_back.repository;

import com.tecnocampus.LS2.protube_back.domain.VideoView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VideoViewRepository extends JpaRepository<VideoView, String> {
    List<VideoView> findByUserIdOrderByViewedAtDesc(String userId);
    Optional<VideoView> findByUserIdAndVideoFileName(String userId, String videoFileName);
}