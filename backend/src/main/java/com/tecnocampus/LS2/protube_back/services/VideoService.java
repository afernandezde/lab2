package com.tecnocampus.LS2.protube_back.services;

import com.tecnocampus.LS2.protube_back.repository.VideoRepository;
import com.tecnocampus.LS2.protube_back.domain.Video;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VideoService {

    private final VideoRepository videoRepository;

    public VideoService(VideoRepository videoRepository) {
        this.videoRepository = videoRepository;
    }

    public List<String> getVideos() {
        return videoRepository.findAll()
            .stream()
            .map(Video::getTitle)
            .toList();
    }

    public Video getVideoById(String id) {
        return videoRepository.findById(id).orElse(null);
    }

    public Video saveVideo(Video video) {
        return videoRepository.save(video);
    }

    public boolean deleteVideo(String id) {
        var existing = videoRepository.findById(id);
        if (existing.isEmpty()) {
            return false;
        }
        videoRepository.deleteById(id);
        return true;
    }

    public java.util.List<com.tecnocampus.LS2.protube_back.domain.Video> getAll() {
        return videoRepository.findAll();
    }
}
