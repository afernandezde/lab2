package com.tecnocampus.LS2.protube_back.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.tecnocampus.LS2.protube_back.domain.Like;

@Repository
public class LikeRepository {
    private List<Like> likes = new java.util.ArrayList<>();

    public Like save(Like like) {
        if (like == null) {
            throw new IllegalArgumentException("Like cannot be null");
        } else if (getLike(like.getUserId(), like.getVideoId()) != null) {
            System.out.println("Like already exists for user " + like.getUserId() + " video " + like.getVideoId());
            return like;
        }
        likes.add(like);
        return like;
    }

    public Like getLike(String userId, String videoId) {
        for (Like like : likes) {
            if (like.getUserId().equals(userId) && like.getVideoId().equals(videoId)) {
                return like;
            }
        }
        return null;
    }

    public void delete(Like like) {
        likes.remove(like);
    }

    public int getLikesForVideo(String videoId) {
        int count = 0;
        for (Like like : likes) {
            if (like.getVideoId().equals(videoId)) {
                count++;
            }
        }
        System.out.println("Counted " + count + " likes for video ID: " + videoId);
        return count;
    }

    public List<Like> getLikesByUser(String userId) {
        List<Like> result = new java.util.ArrayList<>();
        for (Like like : likes) {
            if (like.getUserId().equals(userId)) {
                result.add(like);
            }
        }
        System.out.println("Found " + result.size() + " likes for user ID: " + userId);
        return result;
    }

    public Like unlike(String userId, String videoId) {
        Like like = getLike(userId, videoId);
        if (like != null) {
            delete(like);
            System.out.println("Like removed for user " + userId + " video " + videoId);
        } else {
            System.out.println("No like found to remove for user " + userId + " video " + videoId);
        }
        return like;
    }
}
