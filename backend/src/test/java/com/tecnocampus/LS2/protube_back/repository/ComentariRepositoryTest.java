package com.tecnocampus.LS2.protube_back.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.tecnocampus.LS2.protube_back.domain.Comentari;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class ComentariRepositoryTest {

    private ComentariRepository repo;

    @BeforeEach
    void setUp() {
        repo = new ComentariRepository();
        repo.clear();
    }

    @Test
    void saveGeneratesIdAndCanBeFound() {
        Comentari c = new Comentari(null, "user-1", "video-1", "titulo", "descr");
        Comentari saved = repo.save(c);

        assertNotNull(saved.getId(), "Saved comentari should have an id");
        Optional<Comentari> found = repo.findById(saved.getId());
        assertTrue(found.isPresent());
        assertEquals("user-1", found.get().getUserId());
    }

    @Test
    void saveThrowsExceptionWhenNull() {
        assertThrows(IllegalArgumentException.class, () -> repo.save(null));
    }

    @Test
    void findAllAndDelete() {
        Comentari a = repo.save(new Comentari(null, "u1", "v1", "t1", "d1"));
        Comentari b = repo.save(new Comentari(null, "u2", "v2", "t2", "d2"));
        assertNotNull(b.getId());

        assertEquals(2, repo.findAll().size());

        boolean removed = repo.deleteById(a.getId());
        assertTrue(removed);
        assertFalse(repo.findById(a.getId()).isPresent());
        assertEquals(1, repo.findAll().size());
    }

    @Test
    void findByVideoIdReturnsMatchingComments() {
        repo.save(new Comentari(null, "u1", "v1", "t1", "d1"));
        repo.save(new Comentari(null, "u2", "v1", "t2", "d2"));
        repo.save(new Comentari(null, "u3", "v2", "t3", "d3"));

        List<Comentari> v1Comments = repo.findByVideoId("v1");
        assertEquals(2, v1Comments.size());
        assertTrue(v1Comments.stream().allMatch(c -> c.getVideoId().equals("v1")));
    }

    @Test
    void findByVideoIdReturnsEmptyWhenNull() {
        assertTrue(repo.findByVideoId(null).isEmpty());
    }

    @Test
    void findByUserIdReturnsMatchingComments() {
        repo.save(new Comentari(null, "u1", "v1", "t1", "d1"));
        repo.save(new Comentari(null, "u1", "v2", "t2", "d2"));
        repo.save(new Comentari(null, "u2", "v3", "t3", "d3"));

        List<Comentari> u1Comments = repo.findByUserId("u1");
        assertEquals(2, u1Comments.size());
        assertTrue(u1Comments.stream().allMatch(c -> c.getUserId().equals("u1")));
    }

    @Test
    void findByUserIdReturnsEmptyWhenNull() {
        assertTrue(repo.findByUserId(null).isEmpty());
    }

    @Test
    void findAllGroupedByVideoReturnsMap() {
        repo.save(new Comentari(null, "u1", "v1", "t1", "d1"));
        repo.save(new Comentari(null, "u2", "v1", "t2", "d2"));
        repo.save(new Comentari(null, "u3", "v2", "t3", "d3"));

        Map<String, List<Comentari>> map = repo.findAllGroupedByVideo();
        assertEquals(2, map.size());
        assertEquals(2, map.get("v1").size());
        assertEquals(1, map.get("v2").size());
    }

    @Test
    void findByIdReturnsEmptyWhenNull() {
        assertTrue(repo.findById(null).isEmpty());
    }

    @Test
    void deleteByIdReturnsFalseWhenNull() {
        assertFalse(repo.deleteById(null));
    }
    
    @Test
    void deleteByIdReturnsFalseWhenNotFound() {
        assertFalse(repo.deleteById("non-existent"));
    }
}
