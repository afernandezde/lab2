package com.tecnocampus.LS2.protube_back.services;

import com.tecnocampus.LS2.protube_back.repository.UserRepository;
import com.tecnocampus.LS2.protube_back.domain.User;
import com.tecnocampus.LS2.protube_back.controller.dto.UserDTO;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserService {
    private UserRepository repository;

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

    public boolean login(String email, String password) {
        var userOpt = repository.findByEmail(email);
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            System.out.println("Usuario autenticado con éxito. ID: " + userOpt.get().getId());
            return true;
        } else {
            System.out.println("Error: correo o contraseña inválidos.");
            return false;
        }
    }
}
