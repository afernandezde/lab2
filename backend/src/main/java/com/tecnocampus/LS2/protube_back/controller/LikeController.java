package com.tecnocampus.LS2.protube_back.controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.tecnocampus.LS2.protube_back.services.LikeService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@RestController
@RequestMapping("/api/likes")
public class LikeController {
    private LikeService likeService;

    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    }
    
    @GetMapping("/{userId}/{videoId}")
    public boolean isVideoLikedByUser(@PathVariable String userId, @PathVariable String videoId) {
        return likeService.isVideoLikedByUser(userId, videoId);
    }

    @PostMapping("/{userId}/{videoId}")
    public void likeVideo(@PathVariable String userId, @PathVariable String videoId) {
        likeService.likeVideo(userId, videoId);
    }

    @GetMapping("/user/{userId}")
    public java.util.List<String> getLikesByUser(@PathVariable String userId) {
        return likeService.getLikedVideoIdsByUser(userId);
    }

    @DeleteMapping("/{userId}/{videoId}")
    public void unlikeVideo(@PathVariable String userId, @PathVariable String videoId) {
        likeService.unlikeVideo(userId, videoId);
    }
}
