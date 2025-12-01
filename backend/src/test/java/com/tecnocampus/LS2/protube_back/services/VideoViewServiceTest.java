package com.tecnocampus.LS2.protube_back.services;

import com.tecnocampus.LS2.protube_back.controller.dto.VideoViewDTO;
import com.tecnocampus.LS2.protube_back.domain.Video;
import com.tecnocampus.LS2.protube_back.domain.VideoView;
import com.tecnocampus.LS2.protube_back.repository.VideoRepository;
import com.tecnocampus.LS2.protube_back.repository.VideoViewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VideoViewServiceTest {

    @Mock
    private VideoViewRepository videoViewRepository;

    @Mock
    private VideoRepository videoRepository;

    @InjectMocks
    private VideoViewService videoViewService;

    private VideoView view1;
    private Video video1;

    @BeforeEach
    void setUp() {
        view1 = new VideoView("user1", "video1");
        video1 = new Video("user1", "Title 1", "Desc 1", "video1.mp4");
    }

    @Test
    void addOrUpdateView_createsNewView_whenNotExists() {
        when(videoViewRepository.findByUserIdAndVideoFileName("user1", "video1")).thenReturn(Optional.empty());
        when(videoViewRepository.save(any(VideoView.class))).thenAnswer(inv -> inv.getArgument(0));
        // Exact match
        when(videoRepository.findByFileName("video1")).thenReturn(Optional.empty());
        // Prefix match
        when(videoRepository.findByFileNameStartingWith("video1.")).thenReturn(List.of(video1));

        VideoViewDTO result = videoViewService.addOrUpdateView("user1", "video1");

        assertNotNull(result);
        assertEquals("user1", result.userId());
        assertEquals("video1", result.videoFileName());
        assertEquals("Title 1", result.title()); // Resolved via prefix
        verify(videoViewRepository).save(any(VideoView.class));
    }

    @Test
    void addOrUpdateView_updatesExistingView_whenExists() {
        VideoView existing = new VideoView("user1", "video1");
        long oldTime = existing.getViewedAt();
        
        when(videoViewRepository.findByUserIdAndVideoFileName("user1", "video1")).thenReturn(Optional.of(existing));
        when(videoViewRepository.save(any(VideoView.class))).thenAnswer(inv -> inv.getArgument(0));
        when(videoRepository.findByFileName("video1")).thenReturn(Optional.of(video1));

        VideoViewDTO result = videoViewService.addOrUpdateView("user1", "video1");

        assertNotNull(result);
        assertTrue(existing.getViewedAt() >= oldTime);
        assertEquals("Title 1", result.title());
    }

    @Test
    void addOrUpdateView_throwsException_whenUserIdNull() {
        assertThrows(IllegalArgumentException.class, () -> videoViewService.addOrUpdateView(null, "video1"));
    }

    @Test
    void addOrUpdateView_throwsException_whenVideoFileNameNull() {
        assertThrows(IllegalArgumentException.class, () -> videoViewService.addOrUpdateView("user1", null));
    }

    @Test
    void listViews_returnsList_whenUserHasViews() {
        when(videoViewRepository.findByUserIdOrderByViewedAtDesc("user1")).thenReturn(List.of(view1));
        when(videoRepository.findByFileName("video1")).thenReturn(Optional.of(video1));

        List<VideoViewDTO> result = videoViewService.listViews("user1");

        assertEquals(1, result.size());
        assertEquals("Title 1", result.get(0).title());
    }

    @Test
    void listViews_returnsEmpty_whenUserHasNoViews() {
        when(videoViewRepository.findByUserIdOrderByViewedAtDesc("user1")).thenReturn(List.of());

        List<VideoViewDTO> result = videoViewService.listViews("user1");

        assertTrue(result.isEmpty());
    }

    @Test
    void listViews_returnsEmpty_whenUserIdNull() {
        List<VideoViewDTO> result = videoViewService.listViews(null);
        assertTrue(result.isEmpty());
    }
    
    @Test
    void resolveVideo_usesPrefix_whenExactMatchFails() {
        // This logic is internal but tested via public methods
        when(videoViewRepository.findByUserIdOrderByViewedAtDesc("user1")).thenReturn(List.of(view1));
        when(videoRepository.findByFileName("video1")).thenReturn(Optional.empty());
        when(videoRepository.findByFileNameStartingWith("video1.")).thenReturn(List.of(video1));

        List<VideoViewDTO> result = videoViewService.listViews("user1");
        
        assertEquals("Title 1", result.get(0).title());
    }
}