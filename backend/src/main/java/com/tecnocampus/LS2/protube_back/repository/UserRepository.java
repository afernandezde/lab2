package com.tecnocampus.LS2.protube_back.repository;

import com.tecnocampus.LS2.protube_back.domain.User;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;

import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {
    private List<User> users = new ArrayList<>();

    public void save(User user) {
        Optional<User> existing = users.stream().filter(u -> u.getId().equals(user.getId())).findFirst();
        if (existing.isPresent()) {
            int idx = users.indexOf(existing.get());
            users.set(idx, user);
        } else {
            users.add(user);
        }
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
