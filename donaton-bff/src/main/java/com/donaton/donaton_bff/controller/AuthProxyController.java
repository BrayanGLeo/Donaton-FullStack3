package com.donaton.donaton_bff.controller;

import com.donaton.donaton_bff.client.AuthClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
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
    public ResponseEntity<Object> obtenerUsuarios(
            @RequestParam(value = "rol", required = false) String rol,
            @RequestParam(value = "region", required = false) String region,
            @RequestParam(value = "comuna", required = false) String comuna,
            @RequestParam(value = "rut", required = false) String rut,
            @RequestParam(value = "nombre", required = false) String nombre,
            @RequestParam(value = "activo", required = false) String activo,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortField", defaultValue = "id") String sortField,
            @RequestParam(value = "sortDir", defaultValue = "asc") String sortDir
    ) {
        return authClient.obtenerUsuarios(rol, region, comuna, rut, nombre, activo, page, size, sortField, sortDir);
    }

    @GetMapping("/admin/usuarios/stats")
    public ResponseEntity<Object> obtenerStats() {
        return authClient.obtenerStats();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Object> forgotPassword(@RequestBody Object request) {
        return authClient.forgotPassword(request);
    }

    @PostMapping("/verify-code")
    public ResponseEntity<Object> verifyCode(@RequestBody Object request) {
        return authClient.verifyCode(request);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Object> resetPassword(@RequestBody Object request) {
        return authClient.resetPassword(request);
    }

    @PutMapping("/admin/usuarios/{id}")
    public ResponseEntity<Object> actualizarUsuario(@PathVariable("id") Long id, @RequestBody Object request) {
        return authClient.actualizarUsuario(id, request);
    }

    @DeleteMapping("/admin/usuarios/{id}")
    public ResponseEntity<Object> eliminarUsuario(@PathVariable("id") Long id) {
        return authClient.eliminarUsuario(id);
    }

    @PutMapping("/admin/usuarios/{id}/reactivar")
    public ResponseEntity<Object> reactivarUsuario(@PathVariable("id") Long id) {
        return authClient.reactivarUsuario(id);
    }

    @PutMapping("/admin/usuarios/bulk-status")
    public ResponseEntity<Object> actualizarEstadoMasivo(@RequestBody Object request) {
        return authClient.actualizarEstadoMasivo(request);
    }

    @PutMapping("/usuarios/{id}/password")
    public ResponseEntity<Object> cambiarPassword(@PathVariable("id") Long id, @RequestBody Object request) {
        return authClient.cambiarPassword(id, request);
    }
}
