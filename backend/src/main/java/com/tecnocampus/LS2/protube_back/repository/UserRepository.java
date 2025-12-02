package com.tecnocampus.LS2.protube_back.repository;

import com.tecnocampus.LS2.protube_back.domain.User;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;
import java.io.File;
import java.io.IOException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.beans.factory.annotation.Value;
import jakarta.annotation.PostConstruct;

import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {
    private List<User> users = new ArrayList<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${pro_tube.store.dir}")
    private String storeDir;

    private File getFile() {
        return new File(storeDir, "users.json");
    }

    @PostConstruct
    public void load() {
        File f = getFile();
        if (f.exists()) {
            try {
                users = objectMapper.readValue(f, new TypeReference<List<User>>() {});
                System.out.println("Loaded " + users.size() + " users from " + f.getAbsolutePath());
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private void saveToFile() {
        try {
            File f = getFile();
            if (!f.getParentFile().exists()) f.getParentFile().mkdirs();
            objectMapper.writeValue(f, users);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void save(User user) {
        // Check if user already exists and update it, or add new
        Optional<User> existing = users.stream().filter(u -> u.getId().equals(user.getId())).findFirst();
        if (existing.isPresent()) {
            int idx = users.indexOf(existing.get());
            users.set(idx, user);
        } else {
            users.add(user);
        }
        saveToFile();
    }

    public Optional<User> findByEmail(String email) {
        return users.stream()
                .filter(user -> user.getEmail().equals(email))
                .findFirst();
    }

    public Optional<User> findByUsername(String username) {
        return users.stream()
                .filter(user -> user.getUsername().equals(username))
                .findFirst();
    }

    public List<User> findAll() {
        return new ArrayList<>(users);
    }
}
