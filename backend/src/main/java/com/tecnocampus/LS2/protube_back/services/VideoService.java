package com.tecnocampus.LS2.protube_back.services;

import com.tecnocampus.LS2.protube_back.controller.dto.videoSaveDTO;
import com.tecnocampus.LS2.protube_back.controller.mapper.VideoMapper;
import com.tecnocampus.LS2.protube_back.repository.VideoRepository;
import com.tecnocampus.LS2.protube_back.domain.Video;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class VideoService {

    private final VideoRepository videoRepository;

    public VideoService(VideoRepository videoRepository) {
        this.videoRepository = videoRepository;
    }

    public List<String> getVideos() {
        return videoRepository.findAll()
            .stream()
            .map(Video::getFileName)
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

    // Upload + persist using DTO meta; returns DTO of the saved entity
    public videoSaveDTO uploadAndSave(MultipartFile file, videoSaveDTO meta, boolean published) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No file provided");
        }

        // sanitize original filename
        String original = StringUtils.cleanPath(file.getOriginalFilename());
        if (original.contains("..")) {
            throw new IllegalArgumentException("Invalid filename");
        }

        // derive metadata from DTO (with defaults)
        String userId = meta != null && meta.userId() != null ? meta.userId() : "unknown";
        String title = meta != null && meta.title() != null && !meta.title().isBlank() ? meta.title() : original;
        String description = meta != null && meta.description() != null ? meta.description() : "";

        // store directory outside project
        Path storeDir = Paths.get("$HOME/protube/store").toAbsolutePath().normalize();
        Files.createDirectories(storeDir);

        // persist with unique stored filename
        String storedFileName = UUID.randomUUID().toString() + "_" + original;
        Path target = storeDir.resolve(storedFileName);

        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }

        // build and save entity
        Video toSave = new Video(userId, title, description, storedFileName);
        // If you need to persist "published", add a field in Video and set it here.
        Video saved = saveVideo(toSave);

        return VideoMapper.toVideoSaveDTO(saved);
    }

    // Backwards-compatible overload (delegates to DTO-based method)
    public Video uploadAndSave(MultipartFile file, String userId, String title, String description, boolean published) throws IOException {
        videoSaveDTO meta = new videoSaveDTO(userId, title, description, null);
        videoSaveDTO savedDto = uploadAndSave(file, meta, published);
        // convert back to entity if required by existing callers
        return VideoMapper.toVideo(savedDto);
    }
}
