package com.tecnocampus.LS2.protube_back.controller;

import com.tecnocampus.LS2.protube_back.controller.dto.ComentariDTO;
import com.tecnocampus.LS2.protube_back.services.ComentariService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ComentariControllerTest {

    @InjectMocks
    ComentariController comentariController;

    @Mock
    ComentariService comentariService;

    @Test
    void getComentarios_returnsList() {
        when(comentariService.listAll()).thenReturn(List.of(new ComentariDTO("1","u1","v1","t","d")));
        var resp = comentariController.getComentarios();
        assertEquals(1, resp.getBody().size());
    }

    @Test
    void saveComentario_returnsCreatedString() {
        ComentariDTO dto = new ComentariDTO(null, "u1","v1","t","d");
        ComentariDTO saved = new ComentariDTO("c1","u1","v1","t","d");
        when(comentariService.create(dto, dto.userId())).thenReturn(saved);
        ResponseEntity<String> resp = comentariController.saveComentario(dto);
    assertEquals(200, resp.getStatusCode().value());
        assertTrue(resp.getBody().contains("c1"));
    }

    @Test
    void getCommentsByVideo_returnsList() {
        when(comentariService.findByVideoId("v1")).thenReturn(List.of(new ComentariDTO("1","u1","v1","t","d")));
        var resp = comentariController.getCommentsByVideo("v1");
        assertEquals(1, resp.getBody().size());
    }

    @Test
    void getCommentsMap_returnsMap() {
        when(comentariService.getCommentsGroupedByVideo()).thenReturn(Map.of("v1", List.of(new ComentariDTO("1","u1","v1","t","d"))));
        var resp = comentariController.getCommentsMap();
        assertEquals(1, resp.getBody().size());
    }

    @Test
    void getComentarioById_found() {
        when(comentariService.findById("1")).thenReturn(Optional.of(new ComentariDTO("1","u1","v1","t","d")));
        var resp = comentariController.getComentarioById("1");
    assertEquals(200, resp.getStatusCode().value());
        assertEquals("1", resp.getBody().id());
    }

    @Test
    void getComentarioById_notFound() {
        when(comentariService.findById("1")).thenReturn(Optional.empty());
        var resp = comentariController.getComentarioById("1");
    assertEquals(404, resp.getStatusCode().value());
    }

    @Test
    void deleteComentario_removed() {
        when(comentariService.deleteById("1")).thenReturn(true);
        var resp = comentariController.deleteComentario("1");
    assertEquals(204, resp.getStatusCode().value());
    }

    @Test
    void deleteComentario_notFound() {
        when(comentariService.deleteById("1")).thenReturn(false);
        var resp = comentariController.deleteComentario("1");
    assertEquals(404, resp.getStatusCode().value());
    }

    @Test
    void getCommentsByUser_returnsList() {
        when(comentariService.findByUserId("u1")).thenReturn(List.of(new ComentariDTO("1","u1","v1","t","d")));
        var resp = comentariController.getCommentsByUser("u1");
        assertEquals(1, resp.getBody().size());
    }
}
