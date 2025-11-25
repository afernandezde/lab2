package com.tecnocampus.LS2.protube_back.services;

import com.tecnocampus.LS2.protube_back.controller.dto.videoSaveDTO;
import com.tecnocampus.LS2.protube_back.controller.mapper.VideoMapper;
import com.tecnocampus.LS2.protube_back.repository.VideoRepository;
import com.tecnocampus.LS2.protube_back.domain.Video;
import org.springframework.stereotype.Service;
import org.springframework.core.env.Environment;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.io.OutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class VideoService {

    private final VideoRepository videoRepository;
    private final Path storeBase;

    public VideoService(VideoRepository videoRepository, Environment env) {
        this.videoRepository = videoRepository;
        String configured = env != null ? env.getProperty("pro_tube.store.dir") : null;
        Path base = (configured != null && !configured.isBlank())
                ? Paths.get(configured)
                : Paths.get(System.getProperty("user.dir"), "..", "store");
        this.storeBase = base.toAbsolutePath().normalize();
    }

    public List<String> getVideos() {
        return videoRepository.findAll()
            .stream()
            .map(Video::getFileName)
            .filter(Objects::nonNull)
            .toList();
    }

    public Video getVideoById(String id) {
        if (id == null) return null;
        return videoRepository.findById(id).orElse(null);
    }

    public Video saveVideo(Video video) {
        if (video == null) throw new IllegalArgumentException("video is null");
        return videoRepository.save(video);
    }

    public boolean deleteVideo(String id) {
        if (id == null) return false;
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

    // Upload + persist using DTO meta; writes thumbnail .webp (generated or from uploaded image)
    public videoSaveDTO uploadAndSave(MultipartFile file, MultipartFile thumbnail, videoSaveDTO meta, boolean published) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No file provided");
        }

        // sanitize original filename
        String name = file.getOriginalFilename();
        if (name == null || name.isBlank()) {
            name = "video.mp4";
        }
        String original = StringUtils.cleanPath(name);
        if (original.contains("..")) {
            throw new IllegalArgumentException("Invalid filename");
        }

        // derive metadata from DTO (with defaults)
        String userId = meta != null && meta.userId() != null ? meta.userId() : "unknown";
        String title = meta != null && meta.title() != null && !meta.title().isBlank() ? meta.title() : original;
        String description = meta != null && meta.description() != null ? meta.description() : "";

        // ensure store base exists
        Path storeDir = this.storeBase;
        Files.createDirectories(storeDir);

        // persist with unique stored filename
        String storedFileName = UUID.randomUUID().toString() + "_" + original;
        Path target = storeDir.resolve(storedFileName);

        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }

        // build and save entity (repository contains metadata; fileName points to stored video file name)
        Video toSave = new Video(userId, title, description, storedFileName);
        Video saved = saveVideo(toSave);

        // Thumbnail logic (uploaded OR auto-generated)
        String baseName = storedFileName.replaceFirst("\\.[^.]+$", "");
        Path thumbPath = storeDir.resolve(baseName + ".webp");
        if (thumbnail != null && !thumbnail.isEmpty()) {
            try {
                // Attempt to convert user-supplied image to webp (scale to width 320 keeping aspect)
                Path tempThumb = storeDir.resolve(UUID.randomUUID() + "_tmp_thumb_upload");
                try (InputStream tin = thumbnail.getInputStream()) {
                    Files.copy(tin, tempThumb, StandardCopyOption.REPLACE_EXISTING);
                }
                convertImageToWebp(tempThumb, thumbPath);
                Files.deleteIfExists(tempThumb);
            } catch (Exception ex) {
                // Fallback: generate from video
                try { generateThumbnail(target, thumbPath); } catch (Exception ignore) { createEmptyPlaceholder(thumbPath); }
            }
        } else {
            try { generateThumbnail(target, thumbPath); } catch (Exception e) { createEmptyPlaceholder(thumbPath); }
        }

        return VideoMapper.toVideoSaveDTO(saved);
    }

    // Backwards-compatible overload (delegates to DTO-based method)
    public Video uploadAndSave(MultipartFile file, String userId, String title, String description, boolean published) throws IOException {
        videoSaveDTO meta = new videoSaveDTO(userId, title, description, null);
        videoSaveDTO savedDto = uploadAndSave(file, null, meta, published);
        // convert back to entity if required by existing callers
        return VideoMapper.toVideo(savedDto);
    }

    private void generateThumbnail(Path inputVideo, Path outputWebp) throws IOException, InterruptedException {
        // Try to use ffmpeg to grab a frame and save as webp thumbnail
        // Command: ffmpeg -y -ss 00:00:01 -i input -vframes 1 -vf scale=320:-1 output.webp
        ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg", "-y", "-ss", "00:00:01", "-i", inputVideo.toString(),
                "-vframes", "1", "-vf", "scale=320:-1", outputWebp.toString()
        );
        pb.redirectErrorStream(true);
        Process p = pb.start();
        p.getInputStream().transferTo(OutputStream.nullOutputStream());
        int code = p.waitFor();
        if (code != 0) throw new IOException("ffmpeg exited with code " + code);
    }

    private void convertImageToWebp(Path inputImage, Path outputWebp) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg", "-y", "-i", inputImage.toString(), "-vf", "scale=320:-1", outputWebp.toString()
        );
        pb.redirectErrorStream(true);
        Process p = pb.start();
        p.getInputStream().transferTo(OutputStream.nullOutputStream());
        int code = p.waitFor();
        if (code != 0) throw new IOException("ffmpeg (image->webp) exited with code " + code);
    }

    private void createEmptyPlaceholder(Path thumbPath) {
        try { if (!Files.exists(thumbPath)) Files.createFile(thumbPath); } catch (Exception ignored) {}
    }
}
