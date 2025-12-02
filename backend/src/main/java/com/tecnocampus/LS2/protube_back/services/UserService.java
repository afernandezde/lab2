package com.tecnocampus.LS2.protube_back.services;

import com.tecnocampus.LS2.protube_back.repository.UserRepository;
import com.tecnocampus.LS2.protube_back.domain.User;
import com.tecnocampus.LS2.protube_back.controller.dto.UserDTO;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.List;

@Service
public class UserService {
    private UserRepository repository;

    public static enum LoginResult {
        SUCCESS,
        EMAIL_NOT_FOUND,
        WRONG_PASSWORD
    }

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public List<UserDTO> listAllUsers() {
        List<User> users = repository.findAll();
        return users.stream()
                .map(user -> new UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getDescription(), user.getAvatar(), user.getTitle()))
                .toList();
    }

    public void register(String username, String email, String password) {
        try {
            if (repository.findByEmail(email).isPresent()) {
                System.out.println("Error: ya existe un usuario con ese correo.");
                throw new RuntimeException("Error: ya existe un usuario con ese correo.");
            }
            if (repository.findByUsername(username).isPresent()) {
                System.out.println("Error: ya existe un usuario con ese nombre de usuario.");
                throw new RuntimeException("Error: ya existe un usuario con ese nombre de usuario.");
            }

            User newUser = new User(username, email, password);
            repository.save(newUser);
            System.out.println("Usuario registrado con éxito. ID: " + newUser.getId());
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    public void login(String email, String password) {
        try {
            Optional<User> userOpt = repository.findByEmail(email);
            if (userOpt.isEmpty()) {
                System.out.println("Error: el correo no existe.");
                throw new RuntimeException("This email is not registered.");
            }
            if (!userOpt.get().getPassword().equals(password)) {
                System.out.println("Error: la contraseña es incorrecta.");
                throw new RuntimeException("Incorrect password.");
            }
            System.out.println("Usuario autenticado con éxito. ID: " + userOpt.get().getId());
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    public String getUsernameByEmail(String email) {
        Optional<User> userOpt = repository.findByEmail(email);
        if (userOpt.isEmpty()) {
            System.out.println("Error: el correo no existe.");
            throw new RuntimeException("This email is not registered.");
        }
        return userOpt.get().getUsername();
    }

    public UserDTO getUser(String username) {
        Optional<User> userOpt = repository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        User user = userOpt.get();
        return new UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getDescription(), user.getAvatar(), user.getTitle());
    }

    public void updateProfile(String username, String description, String avatar, String title) {
        Optional<User> userOpt = repository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        User user = userOpt.get();
        if (description != null) user.setDescription(description);
        if (avatar != null) user.setAvatar(avatar);
        if (title != null) user.setTitle(title);
        repository.save(user);
    }
}
