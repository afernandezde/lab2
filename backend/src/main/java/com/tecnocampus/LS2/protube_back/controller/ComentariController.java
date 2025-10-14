package com.tecnocampus.LS2.protube_back.controller;

import com.tecnocampus.LS2.protube_back.controller.dto.ComentariDTO;
import com.tecnocampus.LS2.protube_back.services.ComentariService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comentaris")
public class ComentariController {

	private final ComentariService service;

	public ComentariController(ComentariService service) {
		this.service = service;
	}

	@GetMapping
	public List<ComentariDTO> listAll() {
		return service.listAll();
	}

	@GetMapping("/{id}")
	public ResponseEntity<ComentariDTO> getById(@PathVariable String id) {
		return service.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
	}

	@PostMapping
	public ResponseEntity<ComentariDTO> create(@RequestHeader("X-User-Id") String currentUserId, @RequestBody ComentariDTO dto) {
		try {
			ComentariDTO created = service.create(dto, currentUserId);
			return ResponseEntity.status(HttpStatus.CREATED).body(created);
		} catch (IllegalArgumentException ex) {
			return ResponseEntity.badRequest().header("X-Error", ex.getMessage()).build();
		}
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable String id) {
		boolean removed = service.deleteById(id);
		if (!removed) return ResponseEntity.notFound().build();
		return ResponseEntity.noContent().build();
	}
}
