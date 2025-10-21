package com.tecnocampus.LS2.protube_back.controller;

import com.tecnocampus.LS2.protube_back.controller.dto.ComentariDTO;
import com.tecnocampus.LS2.protube_back.services.ComentariService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comentaris")
public class ComentariController {

	@Autowired
	ComentariService comentariService;

	@GetMapping("")
	public ResponseEntity<List<ComentariDTO>> getComentarios() {
		return ResponseEntity.ok().body(comentariService.listAll());
	}

	@PostMapping("/save")
	public ResponseEntity<String> saveComentario(@RequestBody ComentariDTO comentarioDto) {
		try {
			ComentariDTO created = comentariService.create(comentarioDto, comentarioDto != null ? comentarioDto.userId() : null);
			return ResponseEntity.ok(created.toString());
		} catch (IllegalArgumentException ex) {
			return ResponseEntity.badRequest().header("X-Error", ex.getMessage()).build();
		}
	}

	@GetMapping("/video/{videoId}")
	public ResponseEntity<List<ComentariDTO>> getCommentsByVideo(@PathVariable String videoId) {
		return ResponseEntity.ok().body(comentariService.findByVideoId(videoId));
	}

	@GetMapping("/map")
	public ResponseEntity<java.util.Map<String, java.util.List<ComentariDTO>>> getCommentsMap() {
		return ResponseEntity.ok().body(comentariService.getCommentsGroupedByVideo());
	}

	@GetMapping("/user/{userId}")
	public ResponseEntity<List<ComentariDTO>> getCommentsByUser(@PathVariable String userId) {
		return ResponseEntity.ok().body(comentariService.findByUserId(userId));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ComentariDTO> getComentarioById(@PathVariable String id) {
		return comentariService.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteComentario(@PathVariable String id) {
		boolean removed = comentariService.deleteById(id);
		if (!removed) return ResponseEntity.notFound().build();
		return ResponseEntity.noContent().build();
	}
}
