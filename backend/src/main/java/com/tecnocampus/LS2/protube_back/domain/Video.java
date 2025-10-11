package com.tecnocampus.LS2.protube_back.domain;

import java.util.UUID;

import org.springframework.stereotype.Component;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Video {
    @Id
    private String videoId = String.valueOf(UUID.randomUUID());
    private String userId;
    private String title;
    private String description;
    private String fileName;

    public Video() {
    }

    public Video(String videoId, String userId, String title, String description, String fileName) {
        this.videoId = videoId;
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.fileName = fileName;
    }

        public Video(String userId, String title, String description, String fileName) {
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.fileName = fileName;
    }


    public String getVideoId() {
        return videoId;
    }

    public void setVideoId(String videoId) {
        this.videoId = videoId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
}