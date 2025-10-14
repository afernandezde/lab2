package com.tecnocampus.LS2.protube_back.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.tecnocampus.LS2.protube_back.domain.Comentari;

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
}
