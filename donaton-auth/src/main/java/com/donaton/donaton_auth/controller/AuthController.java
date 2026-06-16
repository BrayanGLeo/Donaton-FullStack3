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
import com.donaton.donaton_auth.dto.DonanteRegistroRequest;
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
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );

            Usuario usuario = usuarioRepository.findByEmail(loginRequest.getEmail()).orElseThrow();

            String token = jwtUtil.generateToken(usuario.getEmail(), usuario.getRol(), usuario.getId());

            AuthResponse response = new AuthResponse(
                token, 
                usuario.getEmail(), 
                usuario.getRol(),
                usuario.getId(),
                usuario.getNombreCompleto(),
                usuario.getSubRol(),
                usuario.getRegion(),
                usuario.getCentroAcopioId()
            );
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales inválidas");
        }
    }

    @PostMapping("/registro")
    public ResponseEntity<Object> registrarDonante(@RequestBody DonanteRegistroRequest request) {
        if (usuarioRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Map.of("message", "El correo ya está registrado"));
        }
        Usuario usuario = new Usuario();
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setRol("DONANTE");
        
        // Mapear campos extendidos
        usuario.setTipoPersona(request.getTipoPersona());
        usuario.setNombreCompleto(request.getNombreCompleto());
        usuario.setRazonSocial(request.getRazonSocial());
        usuario.setRut(request.getRut());
        usuario.setGiro(request.getGiro());
        usuario.setNombreContacto(request.getNombreContacto());
        usuario.setTelefono(request.getTelefono());
        usuario.setRegion(request.getRegion());
        usuario.setComuna(request.getComuna());
        usuario.setDireccion(request.getDireccion());
        usuario.setSitioWeb(request.getSitioWeb());
        usuario.setLatitud(request.getLatitud());
        usuario.setLongitud(request.getLongitud());

        usuarioRepository.save(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(java.util.Map.of("message", "Usuario registrado con éxito"));
    }

    @PostMapping("/admin/registro")
    public ResponseEntity<Object> registrarUsuarioAdmin(@RequestBody RegistroAdminRequest nuevoUsuario) {
        if (usuarioRepository.findByEmail(nuevoUsuario.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Map.of("message", "El correo ya está registrado"));
        }
        if (!"LOGISTICA".equals(nuevoUsuario.getRol()) && !"COORDINADOR".equals(nuevoUsuario.getRol())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Map.of("message", "Rol inválido. Solo LOGISTICA o COORDINADOR"));
        }
        Usuario usuario = new Usuario();
        usuario.setEmail(nuevoUsuario.getEmail());
        usuario.setPassword(passwordEncoder.encode(nuevoUsuario.getPassword()));
        usuario.setRol(nuevoUsuario.getRol());
        
        // Mapear campos extendidos
        usuario.setNombreCompleto(nuevoUsuario.getNombreCompleto());
        usuario.setRut(nuevoUsuario.getRut());
        usuario.setTelefono(nuevoUsuario.getTelefono());
        usuario.setRegion(nuevoUsuario.getRegion());
        usuario.setComuna(nuevoUsuario.getComuna());
        usuario.setDireccion(nuevoUsuario.getDireccion());
        
        // Mapear campos Logistica
        if ("LOGISTICA".equals(nuevoUsuario.getRol())) {
            usuario.setSubRol(nuevoUsuario.getSubRol());
            if ("CONDUCTOR".equals(nuevoUsuario.getSubRol())) {
                usuario.setTipoVehiculo(nuevoUsuario.getTipoVehiculo());
                usuario.setMatricula(nuevoUsuario.getMatricula());
            } else if ("RECEPCIONISTA".equals(nuevoUsuario.getSubRol())) {
                usuario.setCentroAcopioId(nuevoUsuario.getCentroAcopioId());
            }
        }
        
        usuarioRepository.save(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(java.util.Map.of("message", "Usuario registrado con éxito"));
    }

    @GetMapping("/usuarios")
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        return ResponseEntity.ok(usuarioRepository.findAll());
    }
}