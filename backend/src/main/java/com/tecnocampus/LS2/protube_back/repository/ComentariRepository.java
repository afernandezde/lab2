package com.tecnocampus.LS2.protube_back.repository;

import org.springframework.stereotype.Repository;

import com.tecnocampus.LS2.protube_back.domain.Comentari;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory repository for Comentari. Thread-safe.
 */
@Repository
public class ComentariRepository {

	private final Map<String, Comentari> store = new ConcurrentHashMap<>();
	public Comentari save(Comentari c) {
		if (c == null) throw new IllegalArgumentException("comentari is null");
		String id = c.getId();
		if (id == null || id.isBlank()) {
			id = String.valueOf(java.util.UUID.randomUUID());
			c.setId(id);
		}
		store.put(id, c);
		return c;
	}

	public List<Comentari> findAll() {
		return new ArrayList<>(store.values());
	}

	public List<Comentari> findByVideoId(String videoId) {
		if (videoId == null) return List.of();
		List<Comentari> out = new ArrayList<>();
		for (Comentari c : store.values()) {
			if (videoId.equals(c.getVideoId())) out.add(c);
		}
		return out;
	}

	public List<Comentari> findByUserId(String userId) {
		if (userId == null) return List.of();
		List<Comentari> out = new ArrayList<>();
		for (Comentari c : store.values()) {
			if (userId.equals(c.getUserId())) out.add(c);
		}
		return out;
	}

	public Map<String, List<Comentari>> findAllGroupedByVideo() {
		Map<String, List<Comentari>> map = new java.util.HashMap<>();
		for (Comentari c : store.values()) {
			map.computeIfAbsent(c.getVideoId(), k -> new ArrayList<>()).add(c);
		}
		return map;
	}

	public Optional<Comentari> findById(String id) {
		if (id == null) return Optional.empty();
		return Optional.ofNullable(store.get(id));
	}

	public boolean deleteById(String id) {
		if (id == null) return false;
		return store.remove(id) != null;
	}

	public void clear() {
		store.clear();
	}
}
