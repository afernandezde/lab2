package com.tecnocampus.LS2.protube_back.services;

import com.tecnocampus.LS2.protube_back.controller.dto.ComentariDTO;
import com.tecnocampus.LS2.protube_back.controller.mapper.ComentariMapper;
import com.tecnocampus.LS2.protube_back.domain.Comentari;
import com.tecnocampus.LS2.protube_back.repository.ComentariRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ComentariService {

	private final ComentariRepository repo;
	private final VideoService videoService;

	public ComentariService(ComentariRepository repo, VideoService videoService) {
		this.repo = repo;
		this.videoService = videoService;
	}

	/**
	 * Create a comment. currentUserId is the id of the authenticated user making the request.
	 */
	public ComentariDTO create(ComentariDTO dto, String currentUserId) {
		if (dto == null) {
			System.out.println("Error: el DTO del comentario es nulo.");
			throw new IllegalArgumentException("dto is null");
		}
		if (currentUserId == null || currentUserId.isBlank()) {
			System.out.println("Error: falta el id del usuario autenticado (currentUserId).");
			throw new IllegalArgumentException("currentUserId (authenticated user) is required");
		}
		if (dto.userId() == null || dto.userId().isBlank()) {
			System.out.println("Error: falta userId; el usuario debe estar autenticado para comentar.");
			throw new IllegalArgumentException("userId is required to create a comment (user must be logged in)");
		}
		if (!currentUserId.equals(dto.userId())) {
			System.out.println("Error: el usuario autenticado no coincide con el userId del comentario.");
			throw new IllegalArgumentException("authenticated user does not match comment userId");
		}
		if (dto.videoId() == null || dto.videoId().isBlank()) {
			System.out.println("Error: falta videoId para crear el comentario.");
			throw new IllegalArgumentException("videoId is required to create a comment");
		}
		if (videoService.getVideoById(dto.videoId()) == null) {
			System.out.println("Error: el vídeo no existe: " + dto.videoId());
			throw new IllegalArgumentException("video does not exist: " + dto.videoId());
		}
		Comentari entity = ComentariMapper.toEntity(dto);
		Comentari saved = repo.save(entity);
		System.out.println("Comentario creado con éxito. ID: " + saved.getId() +
				" | videoId: " + saved.getVideoId() +
				" | userId: " + saved.getUserId());
		return ComentariMapper.toDto(saved);
	}

	public List<ComentariDTO> listAll() {
		return repo.findAll().stream().map(ComentariMapper::toDto).collect(Collectors.toList());
	}

	public List<ComentariDTO> findByVideoId(String videoId) {
		return repo.findByVideoId(videoId).stream().map(ComentariMapper::toDto).collect(Collectors.toList());
	}

	public List<ComentariDTO> findByUserId(String userId) {
		return repo.findByUserId(userId).stream().map(ComentariMapper::toDto).collect(Collectors.toList());
	}

	public java.util.Map<String, java.util.List<ComentariDTO>> getCommentsGroupedByVideo() {
		var grouped = repo.findAllGroupedByVideo();
		java.util.Map<String, java.util.List<ComentariDTO>> out = new java.util.HashMap<>();
		for (var entry : grouped.entrySet()) {
			out.put(entry.getKey(), entry.getValue().stream().map(ComentariMapper::toDto).collect(Collectors.toList()));
		}
		return out;
	}

	public Optional<ComentariDTO> findById(String id) {
		return repo.findById(id).map(ComentariMapper::toDto);
	}

	public boolean deleteById(String id) {
		return repo.deleteById(id);
	}
}
