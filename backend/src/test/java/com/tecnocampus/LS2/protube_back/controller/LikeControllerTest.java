package com.tecnocampus.LS2.protube_back.controller;

import com.tecnocampus.LS2.protube_back.services.LikeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class LikeControllerTest {

    private LikeService likeService;
    private LikeController controller;

    @BeforeEach
    void setUp() {
        likeService = mock(LikeService.class);
        controller = new LikeController(likeService);
    }

    @Test
    void isVideoLikedByUser_returnsTrue() {
        when(likeService.isVideoLikedByUser("u1", "v1")).thenReturn(true);

        boolean result = controller.isVideoLikedByUser("u1", "v1");

        assertTrue(result);
    }

    @Test
    void isVideoLikedByUser_returnsFalse() {
        when(likeService.isVideoLikedByUser("u1", "v1")).thenReturn(false);

        boolean result = controller.isVideoLikedByUser("u1", "v1");

        assertFalse(result);
    }

    @Test
    void likeVideo_callsService() {
        doNothing().when(likeService).likeVideo("u1", "v1");

        controller.likeVideo("u1", "v1");

        verify(likeService).likeVideo("u1", "v1");
    }

    @Test
    void getLikesByUser_returnsList() {
        List<String> likedVideos = Arrays.asList("v1", "v2");
        when(likeService.getLikedVideoIdsByUser("u1")).thenReturn(likedVideos);

        List<String> result = controller.getLikesByUser("u1");

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("v1", result.get(0));
        assertEquals("v2", result.get(1));
    }

    @Test
    void unlikeVideo_callsService() {
        doNothing().when(likeService).unlikeVideo("u1", "v1");

        controller.unlikeVideo("u1", "v1");

        verify(likeService).unlikeVideo("u1", "v1");
    }
}
