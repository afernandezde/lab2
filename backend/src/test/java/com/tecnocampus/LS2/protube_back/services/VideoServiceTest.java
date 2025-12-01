package com.tecnocampus.LS2.protube_back.services;

import com.tecnocampus.LS2.protube_back.controller.dto.videoSaveDTO;
import com.tecnocampus.LS2.protube_back.domain.Video;
import com.tecnocampus.LS2.protube_back.repository.VideoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.core.env.Environment;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class VideoServiceTest {

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private VideoRepository videoRepository;

    @Mock
    private Environment environment;

    private VideoService videoService;

    @TempDir
    Path tempDir;

    private List<Video> fakeDb;

    @BeforeEach
    void setUp() {
        fakeDb = new ArrayList<>();
        // Using 4-arg constructor as seen in VideoService.java
        Video v1 = new Video("user-1", "Title A", "Desc A", "video1");
        setId(v1, "1");
        Video v2 = new Video("user-2", "Title B", "Desc B", "video2");
        setId(v2, "2");
        fakeDb.add(v1);
        fakeDb.add(v2);

        when(videoRepository.findAll()).thenAnswer(inv -> new ArrayList<>(fakeDb));

        when(videoRepository.findById(anyString())).thenAnswer(inv -> {
            String id = inv.getArgument(0);
            return fakeDb.stream().filter(v -> Objects.equals(getId(v), id)).findFirst();
        });

        when(videoRepository.save(any(Video.class))).thenAnswer(inv -> {
            Video incoming = inv.getArgument(0);
            if (getId(incoming) == null || getId(incoming).isEmpty()) {
                setId(incoming, UUID.randomUUID().toString());
            }
            fakeDb.removeIf(x -> Objects.equals(getId(x), getId(incoming)));
            fakeDb.add(incoming);
            return incoming;
        });

        doAnswer(inv -> {
            String id = inv.getArgument(0);
            fakeDb.removeIf(v -> Objects.equals(getId(v), id));
            return null;
        }).when(videoRepository).deleteById(anyString());

        when(environment.getProperty("pro_tube.store.dir")).thenReturn(tempDir.toString());
        videoService = new VideoService(videoRepository, environment);
    }

    // Helper accessors
    private static String getId(Video v) {
        try {
            return (String) Video.class.getDeclaredField("videoId").get(v);
        } catch (Exception ignore) {
            try {
                return (String) Video.class.getMethod("getVideoId").invoke(v);
            } catch (Exception e) {
                return null;
            }
        }
    }
    private static void setId(Video v, String id) {
        try {
            var f = Video.class.getDeclaredField("videoId");
            f.setAccessible(true);
            f.set(v, id);
        } catch (Exception ignore) {
            try {
                Video.class.getMethod("setVideoId", String.class).invoke(v, id);
            } catch (Exception e) {
                // ignore
            }
        }
    }

    @Test
    void getVideos_returnsFileNamesFromRepository() {
        var result = videoService.getVideos();
        assertEquals(List.of("video1", "video2"), result);
    }

    @Test
    void getVideos_whenEmpty_returnsEmptyList() {
        fakeDb.clear();
        var result = videoService.getVideos();
        assertTrue(result.isEmpty());
    }

    @Test
    void getVideoById_whenExists_returnsVideo() {
        var found = videoService.getVideoById("1");
        assertNotNull(found);
        assertEquals("Title A", found.getTitle());
        assertEquals("video1", found.getFileName());
    }

    @Test
    void getVideoById_whenMissing_returnsNull() {
        var found = videoService.getVideoById("missing");
        assertNull(found);
    }

    @Test
    void getVideoById_whenNull_returnsNull() {
        var found = videoService.getVideoById(null);
        assertNull(found);
    }

    @Test
    void saveVideo_persistsAndReturnsEntity() {
        var toSave = new Video("user-3", "New Title", "New Desc", "newFile");
        var saved = videoService.saveVideo(toSave);
        assertNotNull(saved);
        assertNotNull(getId(saved));
        assertEquals("newFile", saved.getFileName());
        
        var names = fakeDb.stream().map(Video::getFileName).collect(Collectors.toList());
        assertTrue(names.contains("newFile"));
    }

    @Test
    void saveVideo_throwsException_whenVideoIsNull() {
        assertThrows(IllegalArgumentException.class, () -> videoService.saveVideo(null));
    }

    @Test
    void deleteVideo_whenExists_returnsTrueAndCallsDelete() {
        assertTrue(fakeDb.stream().anyMatch(v -> Objects.equals(getId(v), "1")));
        boolean deleted = videoService.deleteVideo("1");
        assertTrue(deleted);
        verify(videoRepository).deleteById("1");
        assertFalse(fakeDb.stream().anyMatch(v -> Objects.equals(getId(v), "1")));
    }

    @Test
    void deleteVideo_whenMissing_returnsFalseAndDoesNotDelete() {
        boolean deleted = videoService.deleteVideo("missing");
        assertFalse(deleted);
        verify(videoRepository, never()).deleteById("missing");
    }

    @Test
    void deleteVideo_whenNull_returnsFalse() {
        boolean deleted = videoService.deleteVideo(null);
        assertFalse(deleted);
    }

    @Test
    void getAll_returnsAllFromRepository() {
        var all = videoService.getAll();
        assertEquals(2, all.size());
        assertEquals("Title A", all.get(0).getTitle());
        assertEquals("Title B", all.get(1).getTitle());
    }

    @Test
    void uploadAndSave_happyPath() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "test.mp4", "video/mp4", "content".getBytes());
        videoSaveDTO meta = new videoSaveDTO("user-u", "Upload Title", "Upload Desc", null);

        videoSaveDTO result = videoService.uploadAndSave(file, null, meta, false);

        assertNotNull(result);
        assertEquals("Upload Title", result.title());
        assertEquals("Upload Desc", result.description());
        
        Video savedVideo = fakeDb.stream().filter(v -> "Upload Title".equals(v.getTitle())).findFirst().orElse(null);
        assertNotNull(savedVideo);
        String storedFileName = savedVideo.getFileName();
        assertTrue(Files.exists(tempDir.resolve(storedFileName)));
    }

    @Test
    void uploadAndSave_throwsException_whenFileIsNull() {
        assertThrows(IllegalArgumentException.class, () -> 
            videoService.uploadAndSave(null, null, null, false)
        );
    }

    @Test
    void uploadAndSave_throwsException_whenFileIsEmpty() {
        MockMultipartFile file = new MockMultipartFile("file", "", "video/mp4", new byte[0]);
        assertThrows(IllegalArgumentException.class, () -> 
            videoService.uploadAndSave(file, null, null, false)
        );
    }

    @Test
    void uploadAndSave_throwsException_whenFilenameInvalid() {
        MockMultipartFile file = new MockMultipartFile("file", "../test.mp4", "video/mp4", "content".getBytes());
        assertThrows(IllegalArgumentException.class, () -> 
            videoService.uploadAndSave(file, null, null, false)
        );
    }
    
    @Test
    void uploadAndSave_overload_happyPath() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "test2.mp4", "video/mp4", "content".getBytes());
        Video result = videoService.uploadAndSave(file, "user-x", "Title X", "Desc X", true);
        
        assertNotNull(result);
        assertEquals("Title X", result.getTitle());
        assertTrue(Files.exists(tempDir.resolve(result.getFileName())));
    }
}