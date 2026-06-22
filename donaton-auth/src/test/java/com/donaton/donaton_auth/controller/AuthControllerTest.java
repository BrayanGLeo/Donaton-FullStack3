package com.donaton.donaton_auth.controller;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import com.donaton.donaton_auth.dto.AuthResponse;
import com.donaton.donaton_auth.dto.LoginRequest;
import com.donaton.donaton_auth.entity.Usuario;
import com.donaton.donaton_auth.repository.UsuarioRepository;
import com.donaton.donaton_auth.security.JwtUtil;
import com.donaton.donaton_auth.service.EmailService;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthController authController;

    private LoginRequest loginRequest;
    private Usuario usuario;

    @BeforeEach
    void setUp() {
        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@donaton.cl");
        loginRequest.setPassword("123456");

        usuario = new Usuario();
        usuario.setId(1L);
        usuario.setEmail("test@donaton.cl");
        usuario.setRol("ADMIN");
        usuario.setNombreCompleto("Test Admin");
    }

    @Test
    void testLogin_Success() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(usuarioRepository.findByEmail("test@donaton.cl")).thenReturn(Optional.of(usuario));
        when(jwtUtil.generateToken("test@donaton.cl", "ADMIN", 1L, false)).thenReturn("tokenFalso123");

        ResponseEntity<?> response = authController.login(loginRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof AuthResponse);
        AuthResponse authResponse = (AuthResponse) response.getBody();
        assertEquals("tokenFalso123", authResponse.getToken());
        assertEquals("test@donaton.cl", authResponse.getEmail());
        assertEquals(1L, authResponse.getId());
    }

    @Test
    void testLogin_InvalidCredentials() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        ResponseEntity<?> response = authController.login(loginRequest);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Credenciales inválidas", response.getBody());
    }

    @Test
    @SuppressWarnings("unchecked")
    void testRegistrarDonante_Success() {
        com.donaton.donaton_auth.dto.DonanteRegistroRequest request = new com.donaton.donaton_auth.dto.DonanteRegistroRequest();
        request.setEmail("nuevo@donaton.cl");
        request.setPassword("123456");
        request.setLatitud(-33.4);
        request.setLongitud(-70.6);

        when(usuarioRepository.findByEmail("nuevo@donaton.cl")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("123456")).thenReturn("encoded_pass");

        ResponseEntity<Object> response = authController.registrarDonante(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        java.util.Map<String, String> responseBody = (java.util.Map<String, String>) response.getBody();
        assertEquals("Usuario registrado con éxito", responseBody.get("message"));
    }
}