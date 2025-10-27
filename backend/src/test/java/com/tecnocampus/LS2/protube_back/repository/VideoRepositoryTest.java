package com.tecnocampus.LS2.protube_back.repository;

import com.tecnocampus.LS2.protube_back.domain.Video;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY) // usa BBDD en memoria
class VideoRepositoryTest {

    @Autowired
    private VideoRepository videoRepository;

    private Video v1;
    private Video v2;

    @BeforeEach
    void setUp() {
        videoRepository.deleteAll();

        // Crea y guarda dos vídeos de ejemplo
        v1 = new Video("rid-1", "user-1", "Repo Title A", "Repo Desc A", "fileA.mp4");
        v2 = new Video("rid-2", "user-2", "Repo Title B", "Repo Desc B", "fileB.mp4");

        videoRepository.save(v1);
        videoRepository.save(v2);
    }

    @Test
    void findAll_returnsAllPersistedEntities() {
        List<Video> all = videoRepository.findAll();
        assertEquals(2, all.size());
        assertTrue(all.stream().anyMatch(v -> "Repo Title A".equals(v.getTitle())));
        assertTrue(all.stream().anyMatch(v -> "Repo Title B".equals(v.getTitle())));
    }

    @Test
    void findById_whenExists_returnsEntity() {
        Optional<Video> found = videoRepository.findById("rid-1");
        assertTrue(found.isPresent());
        assertEquals("Repo Title A", found.get().getTitle());
        assertEquals("fileA.mp4", found.get().getFileName());
    }

    @Test
    void findById_whenMissing_returnsEmpty() {
        Optional<Video> missing = videoRepository.findById("nope");
        assertTrue(missing.isEmpty());
    }

    @Test
    void save_createsNewEntity() {
        Video v3 = new Video("rid-3", "user-3", "Repo Title C", "Repo Desc C", "fileC.mp4");

        Video saved = videoRepository.save(v3);

        assertNotNull(saved);
        assertEquals("rid-3", saved.getVideoId());
        assertEquals(3, videoRepository.findAll().size());
    }

    @Test
    void save_withExistingId_updatesEntity() {
        // actualizar título manteniendo el mismo id
        Video updated = new Video("rid-1", "user-1", "Repo Title A - Updated", "Repo Desc A", "fileA.mp4");

        Video saved = videoRepository.save(updated);

        assertEquals("rid-1", saved.getVideoId());
        assertEquals("Repo Title A - Updated", saved.getTitle());

        // verifica que hay 2 y que el primero está actualizado
        List<Video> all = videoRepository.findAll();
        assertEquals(2, all.size());
        assertTrue(all.stream().anyMatch(v -> "Repo Title A - Updated".equals(v.getTitle())));
    }
}