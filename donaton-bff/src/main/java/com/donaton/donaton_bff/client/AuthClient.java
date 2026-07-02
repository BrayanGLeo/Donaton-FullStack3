package com.donaton.donaton_bff.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "donaton-auth")
public interface AuthClient {

    @PostMapping("/api/auth/login")
    ResponseEntity<Object> login(@RequestBody Object request);

    @PostMapping("/api/auth/registro")
    ResponseEntity<Object> registrarDonante(@RequestBody Object request);

    @PostMapping("/api/auth/admin/registro")
    ResponseEntity<Object> registrarAdmin(@RequestBody Object request);

    @GetMapping("/api/auth/usuarios")
    ResponseEntity<Object> obtenerUsuarios(
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
    );

    @GetMapping("/api/auth/admin/usuarios/stats")
    ResponseEntity<Object> obtenerStats();

    @PostMapping("/api/auth/forgot-password")
    ResponseEntity<Object> forgotPassword(@RequestBody Object request);

    @PostMapping("/api/auth/verify-code")
    ResponseEntity<Object> verifyCode(@RequestBody Object request);

    @PostMapping("/api/auth/reset-password")
    ResponseEntity<Object> resetPassword(@RequestBody Object request);

    @PutMapping("/api/auth/admin/usuarios/{id}")
    ResponseEntity<Object> actualizarUsuario(@PathVariable("id") Long id, @RequestBody Object request);

    @DeleteMapping("/api/auth/admin/usuarios/{id}")
    ResponseEntity<Object> eliminarUsuario(@PathVariable("id") Long id);

    @PutMapping("/api/auth/admin/usuarios/{id}/reactivar")
    ResponseEntity<Object> reactivarUsuario(@PathVariable("id") Long id);

    @PutMapping("/api/auth/admin/usuarios/bulk-status")
    ResponseEntity<Object> actualizarEstadoMasivo(@RequestBody Object request);

    @PutMapping("/api/auth/usuarios/{id}/password")
    ResponseEntity<Object> cambiarPassword(@PathVariable("id") Long id, @RequestBody Object request);
}
