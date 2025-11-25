package com.tecnocampus.LS2.protube_back.services;

import com.tecnocampus.LS2.protube_back.domain.Video;
import com.tecnocampus.LS2.protube_back.repository.VideoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.*;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT) // evita UnnecessaryStubbing por stubs globales
@SuppressWarnings({"null"})
class VideoServiceTest {

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private VideoRepository videoRepository;

    @InjectMocks
    private VideoService videoService;

    // Fake in-memory "DB"
    private List<Video> fakeDb;

    // Sample entities
    private Video v1;
    private Video v2;

    @BeforeEach
    void setUp() {
        // Prepare sample videos
        v1 = new Video("1", "user-1", "Title A", "Desc A", "video1");
        v2 = new Video("2", "user-2", "Title B", "Desc B", "video2");

        fakeDb = new ArrayList<>();
        fakeDb.add(v1);
        fakeDb.add(v2);

        // Stubs that operate over the fakeDb so all tests see consistent behavior
        when(videoRepository.findAll()).thenAnswer(inv -> new ArrayList<>(fakeDb));

        when(videoRepository.findById(org.mockito.ArgumentMatchers.argThat(s -> s != null))).thenAnswer(inv -> {
            String id = inv.getArgument(0);
            return fakeDb.stream().filter(v -> Objects.equals(getId(v), id)).findFirst();
        });

        when(videoRepository.save(org.mockito.ArgumentMatchers.argThat(v -> v != null))).thenAnswer(inv -> {
            Video incoming = inv.getArgument(0);
            // If no id, generate one (simulate DB behavior loosely)
            if (getId(incoming) == null || getId(incoming).isEmpty()) {
                setId(incoming, UUID.randomUUID().toString());
            }
            // upsert
            fakeDb.removeIf(x -> Objects.equals(getId(x), getId(incoming)));
            fakeDb.add(incoming);
            return incoming;
        });

        // delete: rely on service logic + verification; repository mock will do nothing
    }

    // Helper accessors to avoid relying on Lombok/setters visibility
    private static String getId(Video v) {
        // assuming getter exists; if not, adapt as needed
        try {
            return (String) Video.class.getDeclaredField("videoId").get(v);
        } catch (Exception ignore) {
            // fallback to typical getter
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
                // ignore for tests
            }
        }
    }

    @Test
    void getVideos_returnsFileNamesFromRepository() {
        // Act
        var result = videoService.getVideos();

        // Assert
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
    void saveVideo_persistsAndReturnsEntity() {
        var toSave = new Video(null, "user-3", "New Title", "New Desc", "newFile");

        var saved = videoService.saveVideo(toSave);

        assertNotNull(saved);
        assertNotNull(getId(saved));
        assertEquals("newFile", saved.getFileName());

        // ensure it was added to the fake DB
        var names = fakeDb.stream().map(Video::getFileName).collect(Collectors.toList());
        assertTrue(names.contains("newFile"));
    }

    @Test
    void deleteVideo_whenExists_returnsTrueAndCallsDelete() {
        assertTrue(fakeDb.stream().anyMatch(v -> Objects.equals(getId(v), "1")));

        boolean deleted = videoService.deleteVideo("1");

        assertTrue(deleted);
        verify(videoRepository).deleteById("1"); // verify repository is called
        assertFalse(fakeDb.stream().anyMatch(v -> Objects.equals(getId(v), "1"))); // removed from fakeDb
    }

    @Test
    void deleteVideo_whenMissing_returnsFalseAndDoesNotDelete() {
        boolean deleted = videoService.deleteVideo("missing");

        assertFalse(deleted);
        verify(videoRepository, never()).deleteById("missing");
    }

    @Test
    void getAll_returnsAllFromRepository() {
        var all = videoService.getAll();

        assertEquals(2, all.size());
        assertEquals("Title A", all.get(0).getTitle());
        assertEquals("Title B", all.get(1).getTitle());
    }
}