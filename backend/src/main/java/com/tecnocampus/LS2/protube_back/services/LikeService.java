package com.tecnocampus.LS2.protube_back.services;

import org.springframework.stereotype.Service;
import com.tecnocampus.LS2.protube_back.repository.LikeRepository;
import com.tecnocampus.LS2.protube_back.domain.Like;

@Service
public class LikeService {
    private final LikeRepository likeRepository;

    public LikeService(LikeRepository likeRepository) {
        this.likeRepository = likeRepository;
    }

    public boolean isVideoLikedByUser(String userId, String videoId) {
        return likeRepository.getAllLikes().stream()
            .anyMatch(like -> like.getUserId().equals(userId) && like.getVideoId().equals(videoId));
    }

    public void likeVideo(String userId, String videoId) {
        if (!isVideoLikedByUser(userId, videoId)) {
            likeRepository.addLike(new Like(userId, videoId));
        }
    }

    public void unlikeVideo(String userId, String videoId) {
        likeRepository.removeLike(userId, videoId);
    }

    public java.util.List<String> getLikedVideoIdsByUser(String userId) {
        java.util.List<String> result = new java.util.ArrayList<>();
        for (Like like : likeRepository.getAllLikes()) {
            if (like.getUserId().equals(userId)) {
                result.add(like.getVideoId());
            }
        }
        return result;
    }
}
