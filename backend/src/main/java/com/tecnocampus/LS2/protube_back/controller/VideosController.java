package com.tecnocampus.LS2.protube_back.controller;

import com.tecnocampus.LS2.protube_back.controller.dto.videoSaveDTO;
import com.tecnocampus.LS2.protube_back.controller.mapper.VideoMapper;
import com.tecnocampus.LS2.protube_back.services.VideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import com.tecnocampus.LS2.protube_back.domain.Video;

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