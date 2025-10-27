package com.tecnocampus.LS2.protube_back.controller;

import com.tecnocampus.LS2.protube_back.controller.dto.videoSaveDTO;
import com.tecnocampus.LS2.protube_back.domain.Video;

import java.util.List;

public final class TestFixtures {
    private TestFixtures() {}

    public static Video sampleVideo1() {
        // (videoId, userId, title, description, fileName)
        return new Video("vid-1", "user-1", "Sample Video 1", "Description 1", "sample1.mp4");
    }

    public static Video sampleVideo2() {
        return new Video("vid-2", "user-2", "Sample Video 2", "Description 2", "sample2.mp4");
    }

    public static List<Video> sampleVideos() {
        return List.of(sampleVideo1(), sampleVideo2());
    }

    public static List<String> sampleVideoTitles() {
        return List.of(sampleVideo1().getTitle(), sampleVideo2().getTitle());
    }

    public static videoSaveDTO sampleSaveDTO() {
        return new videoSaveDTO("user-3", "New Sample", "New description", "newfile.mp4");
    }
}