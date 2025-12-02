package com.tecnocampus.LS2.protube_back.controller;

import com.tecnocampus.LS2.protube_back.controller.dto.PlaylistDTO;
import com.tecnocampus.LS2.protube_back.domain.Playlist;
import com.tecnocampus.LS2.protube_back.services.PlaylistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/playlists")
public class PlaylistController {

    private final PlaylistService playlistService;

    public PlaylistController(PlaylistService playlistService) {
        this.playlistService = playlistService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PlaylistDTO>> getUserPlaylists(@PathVariable String userId) {
        List<Playlist> playlists = playlistService.getPlaylists(userId);
        return ResponseEntity.ok(playlists.stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<PlaylistDTO> createPlaylist(@PathVariable String userId, @RequestBody String name) {
        // Remove quotes if sent as raw string with quotes
        String cleanName = name.replaceAll("^\"|\"$", "");
        try {
            Playlist playlist = playlistService.createPlaylist(cleanName, userId);
            return ResponseEntity.ok(toDTO(playlist));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user/{userId}/watch-later")
    public ResponseEntity<PlaylistDTO> getWatchLater(@PathVariable String userId) {
        Playlist playlist = playlistService.getWatchLater(userId);
        return ResponseEntity.ok(toDTO(playlist));
    }

    @DeleteMapping("/{playlistId}")
    public ResponseEntity<Void> deletePlaylist(@PathVariable String playlistId) {
        playlistService.deletePlaylist(playlistId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{playlistId}/videos/{videoId:.+}")
    public ResponseEntity<Void> addVideo(@PathVariable String playlistId, @PathVariable String videoId) {
        playlistService.addVideoToPlaylist(playlistId, videoId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{playlistId}/videos/{videoId:.+}")
    public ResponseEntity<Void> removeVideo(@PathVariable String playlistId, @PathVariable String videoId) {
        playlistService.removeVideoFromPlaylist(playlistId, videoId);
        return ResponseEntity.ok().build();
    }

    private PlaylistDTO toDTO(Playlist playlist) {
        return new PlaylistDTO(playlist.getId(), playlist.getName(), playlist.getUserId(), playlist.getVideoIds());
    }
}
