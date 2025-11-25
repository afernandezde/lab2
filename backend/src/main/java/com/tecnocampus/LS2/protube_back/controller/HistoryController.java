package com.tecnocampus.LS2.protube_back.controller;

import com.tecnocampus.LS2.protube_back.controller.dto.VideoViewDTO;
import com.tecnocampus.LS2.protube_back.services.VideoViewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final VideoViewService videoViewService;

    public HistoryController(VideoViewService videoViewService) {
        this.videoViewService = videoViewService;
    }

    @PostMapping("/view")
    public ResponseEntity<VideoViewDTO> registerView(@RequestBody ViewRequest request) {
        try {
            var dto = videoViewService.addOrUpdateView(request.userId(), request.videoFileName());
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<VideoViewDTO>> getHistory(@PathVariable String userId) {
        return ResponseEntity.ok(videoViewService.listViews(userId));
    }

    public record ViewRequest(String userId, String videoFileName) {}
}