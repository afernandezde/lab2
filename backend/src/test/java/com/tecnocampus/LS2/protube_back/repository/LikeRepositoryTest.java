package com.tecnocampus.LS2.protube_back.repository;

import com.tecnocampus.LS2.protube_back.domain.Like;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class LikeRepositoryTest {

    private LikeRepository likeRepository;

    @BeforeEach
    void setUp() {
        likeRepository = new LikeRepository();
    }

    @Test
    void addFindAndRemoveLike() {
        Like l = new Like("u1", "v1");

        likeRepository.addLike(l);

        List<Like> all = likeRepository.getAllLikes();
        assertEquals(1, all.size());

        Like found = likeRepository.findLike("u1", "v1");
        assertNotNull(found);
        assertEquals("u1", found.getUserId());
        assertEquals("v1", found.getVideoId());

        likeRepository.removeLike("u1", "v1");
        assertTrue(likeRepository.getAllLikes().isEmpty());
    }

    @Test
    void addDuplicateThrows() {
        Like l = new Like("u1", "v1");
        // The repository's duplicate detection uses object identity (contains),
        // so adding the same instance twice should throw.
        likeRepository.addLike(l);

        assertThrows(IllegalArgumentException.class, () -> likeRepository.addLike(l));
    }

    @Test
    void removeMissingThrows() {
        assertThrows(IllegalArgumentException.class, () -> likeRepository.removeLike("no", "no"));
    }
}
