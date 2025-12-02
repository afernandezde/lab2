package com.tecnocampus.LS2.protube_back.controller;

import com.tecnocampus.LS2.protube_back.controller.dto.UserDTO;
import com.tecnocampus.LS2.protube_back.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class UserControllerTest {

    private UserService userService;
    private UserController controller;

    @BeforeEach
    void setUp() {
        userService = mock(UserService.class);
        controller = new UserController(userService);
    }

    @Test
    void listUsersReturnsDtoList() {
        List<UserDTO> dtos = Arrays.asList(
            new UserDTO("id1", "alice", "a@example.com", null, null, null), 
            new UserDTO("id2", "bob", "b@example.com", null, null, null)
        );
        when(userService.listAllUsers()).thenReturn(dtos);

        ResponseEntity<List<UserDTO>> res = controller.listUsers();
        assertEquals(200, res.getStatusCode().value());
        var body = res.getBody();
        assertNotNull(body);
        assertEquals(2, body.size());
    }

    @Test
    void registerUserSuccess() {
        doNothing().when(userService).register("alex", "alex@example.com", "pw");
        ResponseEntity<String> res = controller.registerUser("alex", "alex@example.com", "pw");
        assertEquals(200, res.getStatusCode().value());
        var body = res.getBody();
        assertNotNull(body);
        assertTrue(body.toLowerCase().contains("registered"));
    }

    @Test
    void registerUserConflict() {
        doThrow(new RuntimeException("Error: ya existe un usuario con ese correo.")).when(userService).register("alex", "alex@example.com", "pw");
        ResponseEntity<String> res = controller.registerUser("alex", "alex@example.com", "pw");
        assertEquals(409, res.getStatusCode().value());
        var body = res.getBody();
        assertNotNull(body);
        assertTrue(body.toLowerCase().contains("ya existe") || body.toLowerCase().contains("exists"));
    }

    @Test
    void loginUserSuccess() {
        doNothing().when(userService).login("u@example.com", "pw");
        ResponseEntity<String> res = controller.loginUser("u@example.com", "pw");
        assertEquals(200, res.getStatusCode().value());
        var body = res.getBody();
        assertNotNull(body);
        assertTrue(body.toLowerCase().contains("logged in") || body.toLowerCase().contains("logged"));
    }

    @Test
    void loginUserEmailNotFound() {
        doThrow(new RuntimeException("This email is not registered.")).when(userService).login("no@example.com", "pw");
        ResponseEntity<String> res = controller.loginUser("no@example.com", "pw");
        assertEquals(404, res.getStatusCode().value());
        var body = res.getBody();
        assertNotNull(body);
        assertTrue(body.toLowerCase().contains("not registered") || body.toLowerCase().contains("no existe") || body.toLowerCase().contains("email"));
    }

    @Test
    void loginUserWrongPassword() {
        doThrow(new RuntimeException("Incorrect password.")).when(userService).login("u@example.com", "bad");
        ResponseEntity<String> res = controller.loginUser("u@example.com", "bad");
        assertEquals(401, res.getStatusCode().value());
        var body = res.getBody();
        assertNotNull(body);
        assertTrue(body.toLowerCase().contains("incorrect") || body.toLowerCase().contains("contraseña"));
    }

    @Test
    void loginUserOtherErrorReturns500() {
        doThrow(new RuntimeException("Something went wrong")).when(userService).login("u@example.com", "pw");
        ResponseEntity<String> res = controller.loginUser("u@example.com", "pw");
        assertEquals(500, res.getStatusCode().value());
        var body = res.getBody();
        assertNotNull(body);
        assertTrue(body.toLowerCase().contains("something") || body.toLowerCase().contains("internal"));
    }
}
