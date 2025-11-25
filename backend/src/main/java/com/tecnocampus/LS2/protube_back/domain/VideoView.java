package com.tecnocampus.LS2.protube_back.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "video_view", indexes = {
        @Index(name = "idx_vview_user", columnList = "userId"),
        @Index(name = "idx_vview_user_file", columnList = "userId,videoFileName")
})
public class VideoView {
    @Id
    private String id = UUID.randomUUID().toString();
    private String userId;
    private String videoFileName; // stored fileName of the video entity
    private long viewedAt; // epoch millis

    public VideoView() {}

    public VideoView(String userId, String videoFileName) {
        this.userId = userId;
        this.videoFileName = videoFileName;
        this.viewedAt = Instant.now().toEpochMilli();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getVideoFileName() { return videoFileName; }
    public void setVideoFileName(String videoFileName) { this.videoFileName = videoFileName; }
    public long getViewedAt() { return viewedAt; }
    public void setViewedAt(long viewedAt) { this.viewedAt = viewedAt; }
}