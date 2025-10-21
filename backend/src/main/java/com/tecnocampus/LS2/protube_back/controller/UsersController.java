package com.tecnocampus.LS2.protube_back.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.tecnocampus.LS2.protube_back.services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;   
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;
import com.tecnocampus.LS2.protube_back.controller.dto.UserDTO;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UsersController {
    private UserService userService;

    public UsersController(UserService userService) {
        this.userService = userService;
    }

    // Endpoint to list all users 
    @GetMapping
    public ResponseEntity<List<UserDTO>> listUsers() {
        List<UserDTO> users = userService.listAllUsers();
        return ResponseEntity.ok(users);
    }

    // Endpoint to register a new user
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestParam String username, @RequestParam String email, @RequestParam String password) {
        boolean success = userService.register(username, email, password);
        if (success) {
            return ResponseEntity.ok("User registered successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error: a user with that email already exists.");
        }
    }

    // Enpoint to login a user
    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@RequestParam String email, @RequestParam String password) {
        try {
            userService.login(email, password);
            return ResponseEntity.ok("User logged in successfully.");
        } catch (RuntimeException e) {
            String msg = e.getMessage();
            if (msg.contains("The email doesn't exist")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(msg);
            } else if (msg.contains("Incorrect password")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(msg);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(msg);
            }
        }
    }
}
