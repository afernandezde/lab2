package com.tecnocampus.LS2.protube_back.controller;

import com.tecnocampus.LS2.protube_back.services.LikeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(LikeController.class)
class LikeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LikeService likeService;

    @Test
    void isVideoLikedByUser_endpointReturnsBoolean() throws Exception {
        when(likeService.isVideoLikedByUser("u1", "v1")).thenReturn(true);

        mockMvc.perform(get("/api/likes/u1/v1"))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    @Test
    void likeVideo_endpointCallsService() throws Exception {
        mockMvc.perform(post("/api/likes/u1/v1"))
                .andExpect(status().isOk());

        verify(likeService).likeVideo("u1", "v1");
    }

    @Test
    void getLikesByUser_returnsList() throws Exception {
        when(likeService.getLikedVideoIdsByUser("u1")).thenReturn(List.of("v1", "v2"));

        mockMvc.perform(get("/api/likes/user/u1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("v1"))
                .andExpect(jsonPath("$[1]").value("v2"));
    }

    @Test
    void unlikeVideo_endpointCallsService() throws Exception {
        mockMvc.perform(delete("/api/likes/u1/v1"))
                .andExpect(status().isOk());

        verify(likeService).unlikeVideo("u1", "v1");
    }
}
