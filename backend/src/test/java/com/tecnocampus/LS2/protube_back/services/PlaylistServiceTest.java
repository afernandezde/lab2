package com.tecnocampus.LS2.protube_back.services;

import com.tecnocampus.LS2.protube_back.domain.Playlist;
import com.tecnocampus.LS2.protube_back.repository.PlaylistRepository;
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
class PlaylistServiceTest {

    @Mock
    private PlaylistRepository playlistRepository;

    @InjectMocks
    private PlaylistService playlistService;

    @Test
    void createPlaylist_success() {
        when(playlistRepository.findByUserIdAndName("u1", "New List")).thenReturn(Optional.empty());
        when(playlistRepository.save(any(Playlist.class))).thenAnswer(i -> i.getArguments()[0]);

        Playlist p = playlistService.createPlaylist("New List", "u1");
        assertNotNull(p);
        assertEquals("New List", p.getName());
        assertEquals("u1", p.getUserId());
    }

    @Test
    void createPlaylist_duplicateName() {
        when(playlistRepository.findByUserIdAndName("u1", "Existing")).thenReturn(Optional.of(new Playlist()));
        
        assertThrows(IllegalArgumentException.class, () -> playlistService.createPlaylist("Existing", "u1"));
    }

    @Test
    void getWatchLater_createsIfMissing() {
        when(playlistRepository.findByUserIdAndName("u1", "Watch Later")).thenReturn(Optional.empty());
        when(playlistRepository.save(any(Playlist.class))).thenAnswer(i -> i.getArguments()[0]);

        Playlist p = playlistService.getWatchLater("u1");
        assertEquals("Watch Later", p.getName());
        verify(playlistRepository).save(any(Playlist.class));
    }

    @Test
    void getWatchLater_returnsExisting() {
        Playlist existing = new Playlist("Watch Later", "u1");
        when(playlistRepository.findByUserIdAndName("u1", "Watch Later")).thenReturn(Optional.of(existing));

        Playlist p = playlistService.getWatchLater("u1");
        assertEquals(existing, p);
        verify(playlistRepository, never()).save(any(Playlist.class));
    }

    @Test
    void addVideoToPlaylist() {
        Playlist p = new Playlist("List", "u1");
        when(playlistRepository.findById("p1")).thenReturn(Optional.of(p));

        playlistService.addVideoToPlaylist("p1", "v1");
        
        assertTrue(p.getVideoIds().contains("v1"));
        verify(playlistRepository).save(p);
    }

    @Test
    void removeVideoFromPlaylist() {
        Playlist p = new Playlist("List", "u1");
        p.addVideoId("v1");
        when(playlistRepository.findById("p1")).thenReturn(Optional.of(p));

        playlistService.removeVideoFromPlaylist("p1", "v1");
        
        assertFalse(p.getVideoIds().contains("v1"));
        verify(playlistRepository).save(p);
    }

    @Test
    void getPlaylist_success() {
        Playlist p = new Playlist("List", "u1");
        when(playlistRepository.findById("p1")).thenReturn(Optional.of(p));

        Playlist result = playlistService.getPlaylist("p1");
        assertEquals(p, result);
    }

    @Test
    void getPlaylist_notFound() {
        when(playlistRepository.findById("p1")).thenReturn(Optional.empty());
        
        assertThrows(RuntimeException.class, () -> playlistService.getPlaylist("p1"));
    }

    @Test
    void deletePlaylist() {
        playlistService.deletePlaylist("p1");
        verify(playlistRepository).deleteById("p1");
    }

    @Test
    void getPlaylists_success() {
        when(playlistRepository.findByUserId("u1")).thenReturn(List.of(new Playlist("P1", "u1")));
        
        List<Playlist> result = playlistService.getPlaylists("u1");
        assertEquals(1, result.size());
        assertEquals("P1", result.get(0).getName());
    }

    @Test
    void addVideoToPlaylist_notFound() {
        when(playlistRepository.findById("p1")).thenReturn(Optional.empty());
        
        assertThrows(RuntimeException.class, () -> playlistService.addVideoToPlaylist("p1", "v1"));
    }

    @Test
    void removeVideoFromPlaylist_notFound() {
        when(playlistRepository.findById("p1")).thenReturn(Optional.empty());
        
        assertThrows(RuntimeException.class, () -> playlistService.removeVideoFromPlaylist("p1", "v1"));
    }
}
