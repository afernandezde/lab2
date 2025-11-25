package com.tecnocampus.LS2.protube_back.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tecnocampus.LS2.protube_back.controller.dto.LikeDTO;
import com.tecnocampus.LS2.protube_back.services.LikeService;

@RestController
@RequestMapping("/api/likes")
public class LikeController {
    private final LikeService likeService;

    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    }

    @GetMapping
    public ResponseEntity<LikeDTO> getLike(@RequestParam String userId, @RequestParam String videoId) {
        try {
            List<LikeDTO> likes = likeService.getLikesByUser(userId);
            for (LikeDTO like : likes) {
                if (like.videoId().equals(videoId)) {
                    return ResponseEntity.ok(like);
                }
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping
    public ResponseEntity<LikeDTO> likeVideo(@RequestParam String userId, @RequestParam String videoId) {
        try {
            LikeDTO likeDTO = likeService.likeVideo(userId, videoId);
            return ResponseEntity.ok(likeDTO);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/video")
    public ResponseEntity<Integer> getLikesForVideo(@RequestParam String videoId) {
        try {
            return ResponseEntity.ok(likeService.getLikesForVideo(videoId));
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/user")
    public ResponseEntity<List<LikeDTO>> getLikesByUser(@RequestParam String userId) {
        try {
            List<LikeDTO> likes = likeService.getLikesByUser(userId);
            return ResponseEntity.ok(likes);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping
    public ResponseEntity<LikeDTO> unlikeVideo(@RequestParam String userId, @RequestParam String videoId, HttpServletRequest request) {
       try {
            System.out.println("Received DELETE /api/likes request. Method=" + request.getMethod() + " userId=" + userId + " videoId=" + videoId);
            System.out.println("Headers: Origin=" + request.getHeader("Origin") + " X-Requested-With=" + request.getHeader("X-Requested-With") + " Referer=" + request.getHeader("Referer"));
            LikeDTO likeDTO = likeService.unlikeVideo(userId, videoId);
            if (likeDTO == null) {
                System.out.println("Unlike: nothing to remove for user=" + userId + " video=" + videoId);
                return ResponseEntity.notFound().build();
            }
            System.out.println("Unlike: removed like id=" + likeDTO.id());
            return ResponseEntity.ok(likeDTO);
        } catch (Exception e) {
            System.out.println("Unlike exception: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

}
