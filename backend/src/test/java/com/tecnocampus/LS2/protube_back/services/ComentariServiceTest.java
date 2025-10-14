package com.tecnocampus.LS2.protube_back.services;

import com.tecnocampus.LS2.protube_back.controller.DTO.ComentariDTO;
import com.tecnocampus.LS2.protube_back.repository.ComentariRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ComentariServiceTest {

    private ComentariRepository repo;
    private ComentariService service;
    private VideoService videoService;

    @BeforeEach
    void setUp() {
        repo = new ComentariRepository();
        repo.clear();
        videoService = new VideoService();
        service = new ComentariService(repo, videoService);
    }

    @Test
    void createHappyPath() {
        ComentariDTO dto = new ComentariDTO(null, "user-1", "video-1", "t", "d");
        ComentariDTO created = service.create(dto, "user-1");
        assertNotNull(created.id());
        assertEquals("user-1", created.userId());
    }

    @Test
    void createFailsWhenUserMissing() {
        ComentariDTO dto = new ComentariDTO(null, null, "video-1", "t", "d");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> service.create(dto, "some-user"));
        assertTrue(ex.getMessage().contains("userId is required"));
    }

    @Test
    void createFailsWhenVideoMissing() {
        ComentariDTO dto = new ComentariDTO(null, "user-1", null, "t", "d");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> service.create(dto, "user-1"));
        assertTrue(ex.getMessage().contains("videoId is required"));
    }

    @Test
    void createFailsWhenAuthenticatedUserMismatch() {
        ComentariDTO dto = new ComentariDTO(null, "user-1", "video-1", "t", "d");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> service.create(dto, "other-user"));
        assertTrue(ex.getMessage().contains("authenticated user does not match"));
    }
}
