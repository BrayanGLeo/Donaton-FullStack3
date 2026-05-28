package com.donaton.donaton_auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;

import com.donaton.donaton_auth.dto.AuthResponse;
import com.donaton.donaton_auth.dto.LoginRequest;
import com.donaton.donaton_auth.dto.RegistroAdminRequest;
import com.donaton.donaton_auth.entity.Usuario;
import com.donaton.donaton_auth.repository.UsuarioRepository;
import com.donaton.donaton_auth.security.JwtUtil;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody LoginRequest loginRequest) {
        try {
            // 1. Validar correo y contraseña
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );

            // 2. Obtener el usuario de la BD para sacar su rol
            Usuario usuario = usuarioRepository.findByEmail(loginRequest.getEmail()).orElseThrow();

            // 3. Crear el token JWT
            String token = jwtUtil.generateToken(usuario.getEmail(), usuario.getRol());

            // 4. Armar y enviar la respuesta
            AuthResponse response = new AuthResponse(token, usuario.getEmail(), usuario.getRol());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales inválidas");
        }
    }

    @PostMapping("/registro")
    public ResponseEntity<String> registrarDonante(@RequestBody LoginRequest loginRequest) {
        if (usuarioRepository.findByEmail(loginRequest.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El correo ya está registrado");
        }
        Usuario usuario = new Usuario();
        usuario.setEmail(loginRequest.getEmail());
        usuario.setPassword(passwordEncoder.encode(loginRequest.getPassword()));
        usuario.setRol("DONANTE");
        usuarioRepository.save(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body("Usuario registrado con éxito");
    }

    @PostMapping("/admin/registro")
    public ResponseEntity<String> registrarUsuarioAdmin(@RequestBody RegistroAdminRequest nuevoUsuario) {
        if (usuarioRepository.findByEmail(nuevoUsuario.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El correo ya está registrado");
        }
        if (!"LOGISTICA".equals(nuevoUsuario.getRol()) && !"COORDINADOR".equals(nuevoUsuario.getRol())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Rol inválido. Solo LOGISTICA o COORDINADOR");
        }
        Usuario usuario = new Usuario();
        usuario.setEmail(nuevoUsuario.getEmail());
        usuario.setPassword(passwordEncoder.encode(nuevoUsuario.getPassword()));
        usuario.setRol(nuevoUsuario.getRol());
        usuarioRepository.save(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body("Usuario registrado con éxito");
    }

    @GetMapping("/usuarios")
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        return ResponseEntity.ok(usuarioRepository.findAll());
    }
}