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
                .map(user -> new UserDTO(user.getId(), user.getUsername(), user.getEmail()))
                .toList();
    }

    public boolean register(String username, String email, String password) {
        if (repository.findByEmail(email).isPresent()) {
            System.out.println("Error: ya existe un usuario con ese correo.");
            return false;
        }

        User newUser = new User(username, email, password);
        repository.save(newUser);
        System.out.println("Usuario registrado con éxito. ID: " + newUser.getId());
        return true;
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
}
