package com.tecnocampus.LS2.protube_back.domain;

import java.util.UUID;

import org.springframework.stereotype.Component;

@Component
public class Like {
    private String id = String.valueOf(UUID.randomUUID());
    private String userId;
    private String videoId;

    public Like() {
    }

    public Like(String userId, String videoId) {
        this.userId = userId;
        this.videoId = videoId;
    }

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getVideoId() {
        return videoId;
    }

    public void setVideoId(String videoId) {
        this.videoId = videoId;
    }
}
