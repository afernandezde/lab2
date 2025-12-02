package com.tecnocampus.LS2.protube_back.repository;

import com.tecnocampus.LS2.protube_back.domain.Playlist;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class PlaylistRepositoryTest {

    @Autowired
    private PlaylistRepository playlistRepository;

    @Test
    void saveAndFind() {
        Playlist p = new Playlist("My List", "user1");
        playlistRepository.save(p);

        Optional<Playlist> found = playlistRepository.findById(p.getId());
        assertTrue(found.isPresent());
        assertEquals("My List", found.get().getName());
    }

    @Test
    void findByUserId() {
        Playlist p1 = new Playlist("List 1", "user1");
        Playlist p2 = new Playlist("List 2", "user1");
        Playlist p3 = new Playlist("List 3", "user2");
        playlistRepository.saveAll(List.of(p1, p2, p3));

        List<Playlist> user1Lists = playlistRepository.findByUserId("user1");
        assertEquals(2, user1Lists.size());
    }

    @Test
    void findByUserIdAndName() {
        Playlist p = new Playlist("Watch Later", "user1");
        playlistRepository.save(p);

        Optional<Playlist> found = playlistRepository.findByUserIdAndName("user1", "Watch Later");
        assertTrue(found.isPresent());
        
        Optional<Playlist> notFound = playlistRepository.findByUserIdAndName("user1", "Other");
        assertFalse(notFound.isPresent());
    }

    @Test
    void deletePlaylist() {
        Playlist p = new Playlist("To Delete", "user1");
        playlistRepository.save(p);
        
        playlistRepository.deleteById(p.getId());
        
        Optional<Playlist> found = playlistRepository.findById(p.getId());
        assertFalse(found.isPresent());
    }

    @Test
    void findNonExistent() {
        Optional<Playlist> found = playlistRepository.findById("non-existent");
        assertFalse(found.isPresent());
    }
}
