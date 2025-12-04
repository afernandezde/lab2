package com.tecnocampus.LS2.protube_back.repository;

import org.springframework.stereotype.Repository;
import org.springframework.beans.factory.annotation.Value;
import jakarta.annotation.PostConstruct;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import java.io.File;
import java.io.IOException;

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
	private final ObjectMapper objectMapper = new ObjectMapper();

	@Value("${pro_tube.store.dir}")
	private String storeDir;

	private File getFile() {
		return new File(storeDir, "comments.json");
	}

	@PostConstruct
	public void load() {
		if (storeDir == null || storeDir.isBlank()) {
			// no store directory configured (likely in unit tests); skip loading from disk
			return;
		}
		File f = getFile();

		if (f.exists()) {
			try {
				List<Comentari> list = objectMapper.readValue(f, new TypeReference<List<Comentari>>() {});
				store.clear();
				for (Comentari c : list) {
					store.put(c.getId(), c);
				}
				System.out.println("Loaded " + store.size() + " comments from " + f.getAbsolutePath());
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}

	private void saveToFile() {
			// if storeDir not configured, skip persisting to disk (use in-memory only)
			if (storeDir == null || storeDir.isBlank()) return;
			try {
				File f = getFile();
				if (f.getParentFile() != null && !f.getParentFile().exists()) f.getParentFile().mkdirs();
				objectMapper.writeValue(f, new ArrayList<>(store.values()));
			} catch (IOException e) {
				e.printStackTrace();
			}
	}

	public Comentari save(Comentari c) {
		if (c == null) throw new IllegalArgumentException("comentari is null");
		String id = c.getId();
		if (id == null || id.isBlank()) {
			id = String.valueOf(java.util.UUID.randomUUID());
			c.setId(id);
		}
		store.put(id, c);
		saveToFile();
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
		boolean removed = store.remove(id) != null;
		if (removed) saveToFile();
		return removed;
	}

	public void clear() {
		store.clear();
		saveToFile();
	}
}
