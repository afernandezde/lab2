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
		if (dto == null) throw new IllegalArgumentException("dto is null");
		if (currentUserId == null || currentUserId.isBlank()) {
			throw new IllegalArgumentException("currentUserId (authenticated user) is required");
		}
		if (dto.userId() == null || dto.userId().isBlank()) {
			throw new IllegalArgumentException("userId is required to create a comment (user must be logged in)");
		}
		if (!currentUserId.equals(dto.userId())) {
			throw new IllegalArgumentException("authenticated user does not match comment userId");
		}
		if (dto.videoId() == null || dto.videoId().isBlank()) {
			throw new IllegalArgumentException("videoId is required to create a comment");
		}
		if (videoService.getVideoById(dto.videoId()) == null) {
			throw new IllegalArgumentException("video does not exist: " + dto.videoId());
		}
		Comentari entity = ComentariMapper.toEntity(dto);
		Comentari saved = repo.save(entity);
		return ComentariMapper.toDto(saved);
	}

	public List<ComentariDTO> listAll() {
		return repo.findAll().stream().map(ComentariMapper::toDto).collect(Collectors.toList());
	}

	public Optional<ComentariDTO> findById(String id) {
		return repo.findById(id).map(ComentariMapper::toDto);
	}

	public boolean deleteById(String id) {
		return repo.deleteById(id);
	}
}
