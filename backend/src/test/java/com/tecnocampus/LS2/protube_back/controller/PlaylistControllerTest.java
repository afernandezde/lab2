package com.tecnocampus.LS2.protube_back.controller;

import com.tecnocampus.LS2.protube_back.controller.dto.PlaylistDTO;
import com.tecnocampus.LS2.protube_back.domain.Playlist;
import com.tecnocampus.LS2.protube_back.services.PlaylistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PlaylistControllerTest {

    private PlaylistService playlistService;
    private PlaylistController controller;

    @BeforeEach
    void setUp() {
        playlistService = mock(PlaylistService.class);
        controller = new PlaylistController(playlistService);
    }

    @Test
    void getUserPlaylistsReturnsList() {
        Playlist p1 = new Playlist("P1", "u1");
        when(playlistService.getPlaylists("u1")).thenReturn(Arrays.asList(p1));

        ResponseEntity<List<PlaylistDTO>> res = controller.getUserPlaylists("u1");
        assertEquals(200, res.getStatusCode().value());
        var body = res.getBody();
        assertNotNull(body);
        assertEquals(1, body.size());
        assertEquals("P1", body.get(0).name());
        assertEquals("u1", body.get(0).userId());
    }

    @Test
    void getUserPlaylistsEmpty() {
        when(playlistService.getPlaylists("u1")).thenReturn(Collections.emptyList());

        ResponseEntity<List<PlaylistDTO>> res = controller.getUserPlaylists("u1");
        assertEquals(200, res.getStatusCode().value());
        var body = res.getBody();
        assertNotNull(body);
        assertTrue(body.isEmpty());
    }

    @Test
    void createPlaylistSuccess() {
        Playlist p = new Playlist("New List", "u1");
        when(playlistService.createPlaylist("New List", "u1")).thenReturn(p);

        ResponseEntity<PlaylistDTO> res = controller.createPlaylist("u1", "\"New List\"");
        assertEquals(200, res.getStatusCode().value());
        var body = res.getBody();
        assertNotNull(body);
        assertEquals("New List", body.name());
        assertEquals("u1", body.userId());
    }

    @Test
    void createPlaylistDuplicate() {
        when(playlistService.createPlaylist("Existing", "u1"))
                .thenThrow(new IllegalArgumentException("Duplicate"));

        ResponseEntity<PlaylistDTO> res = controller.createPlaylist("u1", "\"Existing\"");
        assertEquals(400, res.getStatusCode().value());
    }

    @Test
    void getWatchLaterSuccess() {
        Playlist wl = new Playlist("Watch Later", "u1");
        when(playlistService.getWatchLater("u1")).thenReturn(wl);

        ResponseEntity<PlaylistDTO> res = controller.getWatchLater("u1");
        assertEquals(200, res.getStatusCode().value());
        var body = res.getBody();
        assertNotNull(body);
        assertEquals("Watch Later", body.name());
        assertEquals("u1", body.userId());
    }

    @Test
    void deletePlaylistCallsService() {
        doNothing().when(playlistService).deletePlaylist("p1");
        ResponseEntity<Void> res = controller.deletePlaylist("p1");

        assertEquals(204, res.getStatusCode().value());
        verify(playlistService).deletePlaylist("p1");
    }

    @Test
    void addVideoCallsService() {
        doNothing().when(playlistService).addVideoToPlaylist("p1", "v1");
        ResponseEntity<Void> res = controller.addVideo("p1", "v1");

        assertEquals(200, res.getStatusCode().value());
        verify(playlistService).addVideoToPlaylist("p1", "v1");
    }

    @Test
    void removeVideoCallsService() {
        doNothing().when(playlistService).removeVideoFromPlaylist("p1", "v1");
        ResponseEntity<Void> res = controller.removeVideo("p1", "v1");

        assertEquals(200, res.getStatusCode().value());
        verify(playlistService).removeVideoFromPlaylist("p1", "v1");
    }

    @Test
    void removeVideoWithDotCallsService() {
        doNothing().when(playlistService).removeVideoFromPlaylist("p1", "video.mp4");
        ResponseEntity<Void> res = controller.removeVideo("p1", "video.mp4");

        assertEquals(200, res.getStatusCode().value());
        verify(playlistService).removeVideoFromPlaylist("p1", "video.mp4");
    }
}
