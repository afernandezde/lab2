package com.tecnocampus.LS2.protube_back.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tecnocampus.LS2.protube_back.domain.Playlist;
import com.tecnocampus.LS2.protube_back.services.PlaylistService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Collections;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PlaylistController.class)
@AutoConfigureMockMvc(addFilters = false)
class PlaylistControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PlaylistService playlistService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getUserPlaylists() throws Exception {
        Playlist p1 = new Playlist("P1", "u1");
        when(playlistService.getPlaylists("u1")).thenReturn(Arrays.asList(p1));

        mockMvc.perform(get("/api/playlists/user/u1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("P1"))
                .andExpect(jsonPath("$[0].userId").value("u1"));
    }

    @Test
    void getUserPlaylists_empty() throws Exception {
        when(playlistService.getPlaylists("u1")).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/playlists/user/u1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void createPlaylist() throws Exception {
        Playlist p = new Playlist("New List", "u1");
        when(playlistService.createPlaylist("New List", "u1")).thenReturn(p);

        mockMvc.perform(post("/api/playlists/user/u1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString("New List")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New List"))
                .andExpect(jsonPath("$.userId").value("u1"));
    }

    @Test
    void createPlaylist_duplicate() throws Exception {
        when(playlistService.createPlaylist("Existing", "u1"))
                .thenThrow(new IllegalArgumentException("Duplicate"));

        mockMvc.perform(post("/api/playlists/user/u1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString("Existing")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getWatchLater() throws Exception {
        Playlist wl = new Playlist("Watch Later", "u1");
        when(playlistService.getWatchLater("u1")).thenReturn(wl);

        mockMvc.perform(get("/api/playlists/user/u1/watch-later"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Watch Later"))
                .andExpect(jsonPath("$.userId").value("u1"));
    }

    @Test
    void deletePlaylist() throws Exception {
        mockMvc.perform(delete("/api/playlists/p1"))
                .andExpect(status().isNoContent());

        verify(playlistService).deletePlaylist("p1");
    }

    @Test
    void addVideo() throws Exception {
        mockMvc.perform(post("/api/playlists/p1/videos/v1"))
                .andExpect(status().isOk());

        verify(playlistService).addVideoToPlaylist("p1", "v1");
    }

    @Test
    void removeVideo() throws Exception {
        mockMvc.perform(delete("/api/playlists/p1/videos/v1"))
                .andExpect(status().isOk());

        verify(playlistService).removeVideoFromPlaylist("p1", "v1");
    }

    @Test
    void removeVideo_withDot() throws Exception {
        mockMvc.perform(delete("/api/playlists/p1/videos/video.mp4"))
                .andExpect(status().isOk());

        verify(playlistService).removeVideoFromPlaylist("p1", "video.mp4");
    }
}
