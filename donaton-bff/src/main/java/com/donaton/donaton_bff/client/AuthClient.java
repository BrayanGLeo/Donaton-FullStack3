package com.donaton.donaton_bff.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "donaton-auth")
public interface AuthClient {

    @PostMapping("/api/auth/login")
    ResponseEntity<Object> login(@RequestBody Object request);

    @PostMapping("/api/auth/registro")
    ResponseEntity<String> registrarDonante(@RequestBody Object request);

    @PostMapping("/api/auth/admin/registro")
    ResponseEntity<String> registrarAdmin(@RequestBody Object request);

    @GetMapping("/api/auth/usuarios")
    ResponseEntity<Object> obtenerUsuarios();
}
