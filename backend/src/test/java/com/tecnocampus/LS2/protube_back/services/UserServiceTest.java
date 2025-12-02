package com.tecnocampus.LS2.protube_back.services;

import com.tecnocampus.LS2.protube_back.domain.User;
import com.tecnocampus.LS2.protube_back.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserServiceTest {

    private UserRepository repo;
    private UserService service;

    @BeforeEach
    void setUp() {
        repo = new UserRepository();
        service = new UserService(repo);
    }

    @Test
    void registerHappyPath() {
        service.register("alice", "alice@example.com", "pw");
        var opt = repo.findByEmail("alice@example.com");
        assertTrue(opt.isPresent());
        assertEquals("alice", opt.get().getUsername());
    }

    @Test
    void registerFailsWhenEmailExists() {
        repo.save(new User("bob", "bob@example.com", "pw"));
        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.register("newuser", "bob@example.com", "pw2"));
        String msg = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";
        assertTrue(msg.contains("ya existe") || msg.contains("exists") || msg.contains("already"));
    }

    @Test
    void registerFailsWhenUsernameExists() {
        repo.save(new User("bob", "bob2@example.com", "pw"));
        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.register("bob", "new@example.com", "pw2"));
        String msg = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";
        assertTrue(msg.contains("nombre de usuario") || msg.contains("username") || msg.contains("ya existe"));
    }

    @Test
    void loginHappyPath() {
        repo.save(new User("carol", "carol@example.com", "secret"));
        assertDoesNotThrow(() -> service.login("carol@example.com", "secret"));
    }

    @Test
    void loginFailsWhenEmailMissing() {
        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.login("noone@example.com", "pw"));
        String msg = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";
        assertTrue(msg.contains("not registered") || msg.contains("email") || msg.contains("no existe"));
    }

    @Test
    void loginFailsWhenPasswordIncorrect() {
        repo.save(new User("dave", "dave@example.com", "correct"));
        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.login("dave@example.com", "wrong"));
        String msg = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";
        assertTrue(msg.contains("incorrect") || msg.contains("contraseña") || msg.contains("password"));
    }

    @Test
    void updateProfileHappyPath() {
        service.register("eve", "eve@example.com", "pw");
        service.updateProfile("eve", "New Desc", "New Avatar", "New Title");
        
        User user = repo.findByUsername("eve").get();
        assertEquals("New Desc", user.getDescription());
        assertEquals("New Avatar", user.getAvatar());
        assertEquals("New Title", user.getTitle());
    }

    @Test
    void updateProfilePartial() {
        service.register("frank", "frank@example.com", "pw");
        service.updateProfile("frank", "Desc 1", "Avatar 1", "Title 1");
        
        service.updateProfile("frank", "Desc 2", null, null);
        
        User user = repo.findByUsername("frank").get();
        assertEquals("Desc 2", user.getDescription());
        assertEquals("Avatar 1", user.getAvatar());
        assertEquals("Title 1", user.getTitle());
    }

    @Test
    void updateProfileNoDuplicates() {
        service.register("grace", "grace@example.com", "pw");
        service.updateProfile("grace", "Desc 1", "Avatar 1", "Title 1");
        service.updateProfile("grace", "Desc 2", "Avatar 2", "Title 2");
        
        assertEquals(1, repo.findAll().stream().filter(u -> u.getUsername().equals("grace")).count());
    }
}
