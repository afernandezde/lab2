package com.tecnocampus.LS2.protube_back.domain;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
public class Playlist {
    @Id
    private String id = String.valueOf(UUID.randomUUID());
    
    private String name;
    private String userId;
    
    @ElementCollection
    private List<String> videoIds = new ArrayList<>();

    public Playlist() {}

    public Playlist(String name, String userId) {
        this.name = name;
        this.userId = userId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<String> getVideoIds() {
        return videoIds;
    }

    public void setVideoIds(List<String> videoIds) {
        this.videoIds = videoIds;
    }
    
    public void addVideoId(String videoId) {
        if (!this.videoIds.contains(videoId)) {
            this.videoIds.add(videoId);
        }
    }
    
    public void removeVideoId(String videoId) {
        this.videoIds.remove(videoId);
    }
}
