package com.tecnocampus.LS2.protube_back.services;

import com.tecnocampus.LS2.protube_back.domain.Like;
import com.tecnocampus.LS2.protube_back.repository.LikeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LikeServiceTest {

    @Mock
    private LikeRepository likeRepository;

    @InjectMocks
    private LikeService likeService;

    @Test
    void isVideoLikedByUser_trueWhenPresent() {
        when(likeRepository.getAllLikes()).thenReturn(java.util.List.of(new Like("u1", "v1")));

        assertTrue(likeService.isVideoLikedByUser("u1", "v1"));
    }

    @Test
    void likeVideo_addsWhenMissing() {
        when(likeRepository.getAllLikes()).thenReturn(Collections.emptyList());

        likeService.likeVideo("u1", "v1");

        verify(likeRepository).addLike(any(Like.class));
    }

    @Test
    void likeVideo_doesNotAddWhenAlreadyLiked() {
        when(likeRepository.getAllLikes()).thenReturn(java.util.List.of(new Like("u1", "v1")));

        likeService.likeVideo("u1", "v1");

        verify(likeRepository, never()).addLike(any());
    }

    @Test
    void unlikeVideo_callsRepository() {
        likeService.unlikeVideo("u1", "v1");

        verify(likeRepository).removeLike("u1", "v1");
    }
}
