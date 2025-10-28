package com.tecnocampus.LS2.protube_back.repository;

import com.tecnocampus.LS2.protube_back.domain.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class UserRepositoryTest {

    private UserRepository repo;

    @BeforeEach
    void setUp() {
        repo = new UserRepository();
    }

    @Test
    void saveAndFindByEmail() {
        User u = new User("u1", "u1@example.com", "pw");
        repo.save(u);
        Optional<User> opt = repo.findByEmail("u1@example.com");
        assertTrue(opt.isPresent());
        assertEquals("u1", opt.get().getUsername());
        assertEquals("u1@example.com", opt.get().getEmail());
        assertEquals("pw", opt.get().getPassword());
    }

    @Test
    void findByEmailWhenMissing() {
        Optional<User> opt = repo.findByEmail("noone@example.com");
        assertTrue(opt.isEmpty());
    }

    @Test
    void saveAndFindByUsername() {
        User u = new User("john", "john@example.com", "pw");
        repo.save(u);
        Optional<User> opt = repo.findByUsername("john");
        assertTrue(opt.isPresent());
        assertEquals("john@example.com", opt.get().getEmail());
    }

    @Test
    void findAllReturnsCopy() {
        User u1 = new User("a", "a@example.com", "pw1");
        User u2 = new User("b", "b@example.com", "pw2");
        repo.save(u1);
        repo.save(u2);
        List<User> list = repo.findAll();
        assertEquals(2, list.size());
        list.clear();
        List<User> list2 = repo.findAll();
        assertEquals(2, list2.size());
    }
}

