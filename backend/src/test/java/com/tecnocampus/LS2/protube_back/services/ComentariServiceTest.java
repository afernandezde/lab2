package com.tecnocampus.LS2.protube_back.services;

import com.tecnocampus.LS2.protube_back.controller.dto.ComentariDTO;
import com.tecnocampus.LS2.protube_back.domain.Comentari;
import com.tecnocampus.LS2.protube_back.repository.ComentariRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComentariServiceTest {

    @Mock
    private ComentariRepository repo;
    
    @Mock
    private VideoService videoService;

    private ComentariService service;

    @BeforeEach
    void setUp() {
        service = new ComentariService(repo, videoService);
    }

    @Test
    void createHappyPath() {
        when(videoService.getVideoById("video-1")).thenReturn(new com.tecnocampus.LS2.protube_back.domain.Video());
        when(repo.save(any(Comentari.class))).thenAnswer(inv -> {
            Comentari c = inv.getArgument(0);
            c.setId("generated-id");
            return c;
        });

        ComentariDTO dto = new ComentariDTO(null, "user-1", "video-1", "t", "d");
        ComentariDTO created = service.create(dto, "user-1");
        
        assertNotNull(created.id());
        assertEquals("user-1", created.userId());
        verify(repo).save(any(Comentari.class));
    }

    @Test
    void createFailsWhenDtoIsNull() {
        assertThrows(IllegalArgumentException.class, () -> service.create(null, "user-1"));
    }

    @Test
    void createFailsWhenCurrentUserIdIsNull() {
        ComentariDTO dto = new ComentariDTO(null, "user-1", "video-1", "t", "d");
        assertThrows(IllegalArgumentException.class, () -> service.create(dto, null));
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

    @Test
    void createFailsWhenVideoDoesNotExist() {
        when(videoService.getVideoById("video-1")).thenReturn(null);
        ComentariDTO dto = new ComentariDTO(null, "user-1", "video-1", "t", "d");
        
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> service.create(dto, "user-1"));
        assertTrue(ex.getMessage().contains("video does not exist"));
    }

    @Test
    void listAllReturnsMappedDtos() {
        when(repo.findAll()).thenReturn(List.of(new Comentari("id1", "u1", "v1", "t", "d")));
        List<ComentariDTO> result = service.listAll();
        assertEquals(1, result.size());
        assertEquals("id1", result.get(0).id());
    }

    @Test
    void findByVideoIdReturnsMappedDtos() {
        when(repo.findByVideoId("v1")).thenReturn(List.of(new Comentari("id1", "u1", "v1", "t", "d")));
        List<ComentariDTO> result = service.findByVideoId("v1");
        assertEquals(1, result.size());
    }

    @Test
    void findByUserIdReturnsMappedDtos() {
        when(repo.findByUserId("u1")).thenReturn(List.of(new Comentari("id1", "u1", "v1", "t", "d")));
        List<ComentariDTO> result = service.findByUserId("u1");
        assertEquals(1, result.size());
    }

    @Test
    void getCommentsGroupedByVideoReturnsMap() {
        when(repo.findAllGroupedByVideo()).thenReturn(Map.of("v1", List.of(new Comentari("id1", "u1", "v1", "t", "d"))));
        Map<String, List<ComentariDTO>> result = service.getCommentsGroupedByVideo();
        assertEquals(1, result.size());
        assertEquals(1, result.get("v1").size());
    }

    @Test
    void findByIdReturnsDtoWhenFound() {
        when(repo.findById("id1")).thenReturn(Optional.of(new Comentari("id1", "u1", "v1", "t", "d")));
        Optional<ComentariDTO> result = service.findById("id1");
        assertTrue(result.isPresent());
        assertEquals("id1", result.get().id());
    }

    @Test
    void findByIdReturnsEmptyWhenNotFound() {
        when(repo.findById("id1")).thenReturn(Optional.empty());
        Optional<ComentariDTO> result = service.findById("id1");
        assertTrue(result.isEmpty());
    }

    @Test
    void deleteByIdDelegatesToRepo() {
        when(repo.deleteById("id1")).thenReturn(true);
        assertTrue(service.deleteById("id1"));
        verify(repo).deleteById("id1");
    }
}
