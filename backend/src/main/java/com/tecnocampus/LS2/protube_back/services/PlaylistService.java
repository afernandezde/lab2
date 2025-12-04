package com.tecnocampus.LS2.protube_back.services;

import com.tecnocampus.LS2.protube_back.domain.Playlist;
import com.tecnocampus.LS2.protube_back.repository.PlaylistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PlaylistService {
    
    private final PlaylistRepository playlistRepository;

    public PlaylistService(PlaylistRepository playlistRepository) {
        this.playlistRepository = playlistRepository;
    }

    public List<Playlist> getPlaylists(String userId) {
        return playlistRepository.findByUserId(userId);
    }

    public Playlist getPlaylist(String id) {
        return playlistRepository.findById(id).orElseThrow(() -> new RuntimeException("Playlist not found"));
    }

    @Transactional
    public Playlist createPlaylist(String name, String userId) {
        if (playlistRepository.findByUserIdAndName(userId, name).isPresent()) {
            throw new IllegalArgumentException("Playlist with this name already exists");
        }
        Playlist playlist = new Playlist(name, userId);
        return playlistRepository.save(playlist);
    }

    @Transactional
    public void deletePlaylist(String id) {
        playlistRepository.deleteById(id);
    }

    @Transactional
    public void addVideoToPlaylist(String playlistId, String videoId) {
        Playlist playlist = getPlaylist(playlistId);
        playlist.addVideoId(videoId);
        playlistRepository.save(playlist);
    }

    @Transactional
    public void removeVideoFromPlaylist(String playlistId, String videoId) {
        Playlist playlist = getPlaylist(playlistId);
        playlist.removeVideoId(videoId);
        playlistRepository.save(playlist);
    }

    @Transactional
    public Playlist getWatchLater(String userId) {
        return playlistRepository.findByUserIdAndName(userId, "Watch Later")
                .orElseGet(() -> {
                    Playlist p = new Playlist("Watch Later", userId);
                    return playlistRepository.save(p);
                });
    }
}
