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
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
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

    // Upload + persist using DTO meta; also writes thumbnail .webp and metadata .json alongside the video file
    public videoSaveDTO uploadAndSave(MultipartFile file, videoSaveDTO meta, boolean published) throws IOException {
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

        // Generate thumbnail and JSON metadata next to the video
        String baseName = storedFileName.replaceFirst("\\.[^.]+$", "");
        Path thumbPath = storeDir.resolve(baseName + ".webp");
        Path jsonPath = storeDir.resolve(baseName + ".json");
        try {
            generateThumbnail(target, thumbPath);
        } catch (Exception e) {
            // If thumbnail generation fails, create an empty placeholder file
            try { if (!Files.exists(thumbPath)) Files.createFile(thumbPath); } catch (Exception ignored) {}
        }
        try {
            writeMetadataJson(saved, target, jsonPath);
        } catch (Exception e) {
            // best-effort; ignore JSON write failures
        }

        return VideoMapper.toVideoSaveDTO(saved);
    }

    // Backwards-compatible overload (delegates to DTO-based method)
    public Video uploadAndSave(MultipartFile file, String userId, String title, String description, boolean published) throws IOException {
        videoSaveDTO meta = new videoSaveDTO(userId, title, description, null);
        videoSaveDTO savedDto = uploadAndSave(file, meta, published);
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

    private void writeMetadataJson(Video saved, Path inputVideo, Path outputJson) throws IOException, InterruptedException {
        // Try to gather media info with ffprobe; fall back silently if unavailable
        Integer width = null; Integer height = null; Double duration = null;
        try {
            // width x height
            ProcessBuilder dimPb = new ProcessBuilder(
                    "ffprobe", "-v", "error", "-select_streams", "v:0",
                    "-show_entries", "stream=width,height", "-of", "csv=s=x:p=0",
                    inputVideo.toString()
            );
            dimPb.redirectErrorStream(true);
            Process dimProc = dimPb.start();
            String dimOut = new String(dimProc.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();
            dimProc.waitFor();
            if (dimOut.contains("x")) {
                String[] parts = dimOut.split("x");
                width = Integer.parseInt(parts[0].trim());
                height = Integer.parseInt(parts[1].trim());
            }
            // duration
            ProcessBuilder durPb = new ProcessBuilder(
                    "ffprobe", "-v", "error", "-show_entries", "format=duration",
                    "-of", "default=noprint_wrappers=1:nokey=1", inputVideo.toString()
            );
            durPb.redirectErrorStream(true);
            Process durProc = durPb.start();
            String durOut = new String(durProc.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();
            durProc.waitFor();
            if (!durOut.isEmpty()) {
                duration = Double.parseDouble(durOut);
            }
        } catch (Exception ignored) {}

        long ts = System.currentTimeMillis() / 1000L;
        StringBuilder sb = new StringBuilder();
        sb.append("{\n");
        sb.append("  \"id\": \"").append(saved.getVideoId()).append("\",\n");
        if (width != null) sb.append("  \"width\": ").append(width).append(",\n"); else sb.append("  \"width\": null,\n");
        if (height != null) sb.append("  \"height\": ").append(height).append(",\n"); else sb.append("  \"height\": null,\n");
        if (duration != null) sb.append("  \"duration\": ").append(duration).append(",\n"); else sb.append("  \"duration\": null,\n");
        sb.append("  \"title\": ").append(jsonString(saved.getTitle())).append(",\n");
        sb.append("  \"user\": ").append(jsonString(saved.getUserId())).append(",\n");
        sb.append("  \"timestamp\": ").append(ts).append(",\n");
        sb.append("  \"meta\": {\n");
        sb.append("    \"description\": ").append(jsonString(saved.getDescription())).append(",\n");
        sb.append("    \"categories\": [],\n");
        sb.append("    \"tags\": [],\n");
        sb.append("    \"view_count\": 0,\n");
        sb.append("    \"like_count\": 0,\n");
        sb.append("    \"channel\": ").append(jsonString(saved.getUserId())).append(",\n");
        sb.append("    \"channel_follower_count\": 0,\n");
        sb.append("    \"comments\": []\n");
        sb.append("  }\n");
        sb.append("}\n");
        Files.writeString(outputJson, sb.toString(), StandardCharsets.UTF_8);
    }

    private String jsonString(String s) {
        if (s == null) return "null";
        String escaped = s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
        return "\"" + escaped + "\"";
    }
}
