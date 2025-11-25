package com.tecnocampus.LS2.protube_back.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tecnocampus.LS2.protube_back.controller.dto.LikeDTO;
import com.tecnocampus.LS2.protube_back.domain.Like;
import com.tecnocampus.LS2.protube_back.repository.LikeRepository;

@Service
public class LikeService {
    private LikeRepository likeRepository;

    public LikeService(LikeRepository likeRepository) {
        this.likeRepository = likeRepository;
    }

    public LikeDTO likeVideo(String userId, String videoId) {
        Like like = likeRepository.save(new Like(userId, videoId));
        System.out.println("Like created with ID: " + like.getId());
        return new LikeDTO(like.getId(), like.getUserId(), like.getVideoId());
    }

    public int getLikesForVideo(String videoId) {
        System.out.println("Getting likes for video ID: " + videoId);
        return likeRepository.getLikesForVideo(videoId);
    }

    public List<LikeDTO> getLikesByUser(String userId) {
        System.out.println("Getting likes for user ID: " + userId);
        return likeRepository.getLikesByUser(userId).stream()
                .map(like -> new LikeDTO(like.getId(), like.getUserId(), like.getVideoId()))
                .toList();
    }

    public LikeDTO unlikeVideo(String userId, String videoId) {
        Like like  = likeRepository.unlike(userId, videoId);
        System.out.println("Unlike result for user " + userId + " video " + videoId + " -> " + (like != null ? "removed" : "not-found"));
        if (like == null) {
            return null;
        }
        return new LikeDTO(like.getId(), like.getUserId(), like.getVideoId());
    }
}
