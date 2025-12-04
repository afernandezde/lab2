package com.tecnocampus.LS2.protube_back.repository;

import com.tecnocampus.LS2.protube_back.domain.Like;
import java.util.List;

import org.springframework.stereotype.Repository;

import java.util.ArrayList;

@Repository
public class LikeRepository {
    private List<Like> likes = new ArrayList<>();

    public List<Like> getAllLikes() {
        return likes;
    }

    public Like findLike(String userId, String videoId) {
        for (Like like : likes) {
            if (like.getUserId().equals(userId) && like.getVideoId().equals(videoId)) {
                return like;
            }
        }
        return null;
    }

    public void addLike(Like like) {
        if (likes.contains(like)) {
            throw new IllegalArgumentException("Like already exists");
        }
        likes.add(like);
    }

    public void removeLike(String userId, String videoId) {
        Like like = findLike(userId, videoId);
        if (like == null) {
            throw new IllegalArgumentException("Like not found");
        } 
        likes.remove(like);
    }
}
