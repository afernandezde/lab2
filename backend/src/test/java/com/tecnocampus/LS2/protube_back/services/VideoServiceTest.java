package com.tecnocampus.LS2.protube_back.services;

import org.junit.jupiter.api.Test;

import com.tecnocampus.LS2.protube_back.repository.VideoRepository;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class VideoServiceTest {

    private final VideoRepository videoRepository = org.mockito.Mockito.mock(VideoRepository.class);
    private final VideoService videoService = new VideoService(videoRepository);

    @Test
    void shouldGoToFolderVideos() {
        assertEquals(List.of("video1", "video2"), videoService.getVideos());
    }

}