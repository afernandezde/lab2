package com.tecnocampus.LS2.protube_back.controller;

import com.tecnocampus.LS2.protube_back.controller.dto.videoSaveDTO;
import com.tecnocampus.LS2.protube_back.controller.mapper.VideoMapper;
import com.tecnocampus.LS2.protube_back.domain.Video;
import com.tecnocampus.LS2.protube_back.services.VideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/videos")
public class VideosController {

    @Autowired
    VideoService videoService;

    @GetMapping("")
    public ResponseEntity<List<String>> getVideos() {
        return ResponseEntity.ok().body(videoService.getVideos());
    }

    @PostMapping("/save")
    public ResponseEntity<String> saveVideo(@RequestBody videoSaveDTO videoSaveDTO) {
        videoSaveDTO = VideoMapper.toVideoSaveDTO(videoService.saveVideo(VideoMapper.toVideo(videoSaveDTO)));
        return ResponseEntity.ok(videoSaveDTO.toString());
    }

    @GetMapping("/{id}")
    public ResponseEntity<String> getVideoById(@PathVariable String id) {
        var video = videoService.getVideoById(id);
        if (video == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(video.getTitle());
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<videoSaveDTO> uploadVideo(
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestPart(value = "meta", required = false) videoSaveDTO meta,
            @RequestParam(value = "published", required = false, defaultValue = "false") boolean published
    ) {
        try {
            // Use DTO-based method with optional thumbnail
            videoSaveDTO savedDto = videoService.uploadAndSave(file, thumbnail, meta, published);
            Video saved = VideoMapper.toVideo(savedDto);
            return ResponseEntity.ok(VideoMapper.toVideoSaveDTO(saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Video>> getAllVideos() {
        return ResponseEntity.ok(videoService.getAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVideo(@PathVariable String id) {
        boolean deleted = videoService.deleteVideo(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}