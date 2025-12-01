package com.tecnocampus.LS2.protube_back.services;

import com.tecnocampus.LS2.protube_back.controller.dto.VideoViewDTO;
import com.tecnocampus.LS2.protube_back.controller.mapper.VideoViewMapper;
import com.tecnocampus.LS2.protube_back.domain.VideoView;
import com.tecnocampus.LS2.protube_back.domain.Video;
import com.tecnocampus.LS2.protube_back.repository.VideoViewRepository;
import com.tecnocampus.LS2.protube_back.repository.VideoRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VideoViewService {
    private final VideoViewRepository videoViewRepository;
    private final VideoRepository videoRepository;

    public VideoViewService(VideoViewRepository videoViewRepository, VideoRepository videoRepository) {
        this.videoViewRepository = videoViewRepository;
        this.videoRepository = videoRepository;
    }

    public VideoViewDTO addOrUpdateView(String userId, String videoFileName) {
        if (userId == null || userId.isBlank() || videoFileName == null || videoFileName.isBlank()) {
            throw new IllegalArgumentException("userId and videoFileName are required");
        }
        var existing = videoViewRepository.findByUserIdAndVideoFileName(userId, videoFileName).orElse(null);
        if (existing == null) {
            existing = new VideoView(userId, videoFileName);
        } else {
            existing.setViewedAt(Instant.now().toEpochMilli());
        }
        var saved = videoViewRepository.save(existing);
        Video video = resolveVideo(videoFileName);
        return VideoViewMapper.toDTO(saved, video);
    }

    public List<VideoViewDTO> listViews(String userId) {
        if (userId == null || userId.isBlank()) {
            return List.of();
        }
        return videoViewRepository.findByUserIdOrderByViewedAtDesc(userId)
                .stream()
                .map(v -> {
                    Video video = resolveVideo(v.getVideoFileName());
                    return VideoViewMapper.toDTO(v, video);
                })
                .collect(Collectors.toList());
    }

    private Video resolveVideo(String fileName) {
        return videoRepository.findByFileName(fileName)
                .or(() -> {
                    var list = videoRepository.findByFileNameStartingWith(fileName + ".");
                    return list.isEmpty() ? java.util.Optional.empty() : java.util.Optional.of(list.get(0));
                })
                .orElse(null);
    }
}