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
public class UserController {
    private UserService userService;

    public UserController(UserService userService) {
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
        try {
            userService.register(username, email, password);
            return ResponseEntity.ok("User registered successfully.");
        } catch (RuntimeException e) {
            String msg = e.getMessage();
            if (msg != null && (msg.contains("ya existe") || msg.toLowerCase().contains("exists") || msg.toLowerCase().contains("already"))) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(msg);
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(msg != null ? msg : "Internal server error");
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
            if (msg != null && (msg.toLowerCase().contains("email") && msg.toLowerCase().contains("register"))
                    || (msg != null && msg.toLowerCase().contains("not registered"))) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(msg);
            } else if (msg != null && msg.toLowerCase().contains("incorrect")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(msg);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(msg != null ? msg : "Internal server error");
            }
        }
    }
}
