package com.donaton.donaton_bff.controller;

import com.donaton.donaton_bff.client.AuthClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthProxyController {

    private final AuthClient authClient;

    public AuthProxyController(AuthClient authClient) {
        this.authClient = authClient;
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody Object request) {
        return authClient.login(request);
    }

    @PostMapping("/registro")
    public ResponseEntity<Object> registrarDonante(@RequestBody Object request) {
        return authClient.registrarDonante(request);
    }

    @PostMapping("/admin/registro")
    public ResponseEntity<Object> registrarAdmin(@RequestBody Object request) {
        return authClient.registrarAdmin(request);
    }

    @GetMapping("/usuarios")
    public ResponseEntity<Object> obtenerUsuarios() {
        return authClient.obtenerUsuarios();
    }
}
