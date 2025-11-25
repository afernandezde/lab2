package com.tecnocampus.LS2.protube_back.controller;

import com.tecnocampus.LS2.protube_back.controller.dto.videoSaveDTO;
import com.tecnocampus.LS2.protube_back.domain.Video;
import com.tecnocampus.LS2.protube_back.services.VideoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT) // allow the stubbings defined in setUp()
class VideosControllerTest {

    @InjectMocks
    VideosController videosController;

    @Mock
    VideoService videoService;


    private Video sample1;
    private Video sample2;
    private List<Video> fakeDb;        // acts as an in-memory DB of Video objects
    private List<String> fakeTitles;   // derived titles list returned by getVideos()
    private videoSaveDTO sampleSaveDto;
    private Video newVideoWithoutId;
    private Video persistedVideo;

    @BeforeEach
    void setUp() {
        // prepare sample Video instances and a fake "database"
        sample1 = new Video("userA", "First Video", "Description A", "fileA.mp4");
        sample1.setVideoId("1");
        sample2 = new Video("userB", "Second Video", "Description B", "fileB.mp4");
        sample2.setVideoId("2");

        fakeDb = new ArrayList<>();
        fakeDb.add(sample1);
        fakeDb.add(sample2);

        fakeTitles = fakeDb.stream().map(Video::getTitle).collect(Collectors.toList());

        // a sample DTO used when testing save
        sampleSaveDto = new videoSaveDTO("userC", "Saved Video", "Saved description", "saved.mp4");

        // a Video instance that simulates an incoming Video without an explicit id (mapper may set one)
        newVideoWithoutId = new Video("userC", "Saved Video", "Saved description", "saved.mp4");
        // ensure no predictable id for incoming (simulate mapper behavior)
        newVideoWithoutId.setVideoId("");

        // persistedVideo placeholder - will be created by the saveVideo stub (simulates DB generated id)
        persistedVideo = new Video("userC", "Saved Video", "Saved description", "saved.mp4");
        persistedVideo.setVideoId(UUID.randomUUID().toString());

        // stub VideoService methods to work against the fakeDb

        // return titles list
        when(videoService.getVideos()).thenReturn(new ArrayList<>(fakeTitles));

        // get by id: search fakeDb
        when(videoService.getVideoById(anyString())).thenAnswer(invocation -> {
            String id = invocation.getArgument(0);
            return fakeDb.stream().filter(v -> id.equals(v.getVideoId())).findFirst().orElse(null);
        });

        // return all videos
        when(videoService.getAll()).thenReturn(new ArrayList<>(fakeDb));

        // delete: remove from fakeDb and return whether removed
        when(videoService.deleteVideo(anyString())).thenAnswer(invocation -> {
            String id = invocation.getArgument(0);
            return fakeDb.removeIf(v -> id.equals(v.getVideoId()));
        });

        // save: if incoming has no id or empty id, generate one; then add/replace in fakeDb and return it
        when(videoService.saveVideo(any(Video.class))).thenAnswer(invocation -> {
            Video incoming = invocation.getArgument(0);
            if (incoming.getVideoId() == null || incoming.getVideoId().isEmpty()) {
                incoming.setVideoId(UUID.randomUUID().toString());
            }
            fakeDb.removeIf(v -> v.getVideoId().equals(incoming.getVideoId()));
            fakeDb.add(incoming);
            return incoming;
        });

    }

    @Test
    void getVideos_returnsTitlesAndOk() {
        ResponseEntity<List<String>> res = videosController.getVideos();
        assertEquals(HttpStatus.OK, res.getStatusCode());
        assertEquals(List.of("First Video", "Second Video"), res.getBody());
    }

    @Test
    void getVideoById_found_returnsTitleAndOk() {
        ResponseEntity<String> res = videosController.getVideoById("1");
        assertEquals(HttpStatus.OK, res.getStatusCode());
        assertEquals("First Video", res.getBody());
    }

    @Test
    void getVideoById_notFound_returnsNotFound() {
        ResponseEntity<String> res = videosController.getVideoById("missing-id");
        assertEquals(HttpStatus.NOT_FOUND, res.getStatusCode());
        assertNull(res.getBody());
    }

    @Test
    void getAllVideos_returnsAllAndOk() {
        ResponseEntity<List<Video>> res = videosController.getAllVideos();
        assertEquals(HttpStatus.OK, res.getStatusCode());
        var body = res.getBody();
        assertNotNull(body);
        assertEquals(2, body.size());
        assertEquals("First Video", body.get(0).getTitle());
        assertEquals("Second Video", body.get(1).getTitle());
    }

    @Test
    void deleteVideo_success_returnsNoContentAndRemoves() {
        int before = fakeDb.size();
        ResponseEntity<Void> res = videosController.deleteVideo("1");
        assertEquals(HttpStatus.NO_CONTENT, res.getStatusCode());
        assertNull(res.getBody());
        assertEquals(before - 1, fakeDb.size());
        // remaining should be sample2
        assertEquals("Second Video", fakeDb.get(0).getTitle());
    }

    @Test
    void deleteVideo_notFound_returnsNotFoundAndKeepsDb() {
        int before = fakeDb.size();
        ResponseEntity<Void> res = videosController.deleteVideo("nope");
        assertEquals(HttpStatus.NOT_FOUND, res.getStatusCode());
        assertEquals(before, fakeDb.size());
    }

    @Test
    void saveVideo_returnsOkBodyAndPersists() {
        ResponseEntity<String> res = videosController.saveVideo(sampleSaveDto);
        assertEquals(HttpStatus.OK, res.getStatusCode());
        var body = res.getBody();
        assertNotNull(body);
        assertTrue(body.length() > 0);

        // ensure fakeDb contains a video with the saved title
        boolean found = fakeDb.stream().anyMatch(v -> "Saved Video".equals(v.getTitle()));
        assertTrue(found);
    }
}