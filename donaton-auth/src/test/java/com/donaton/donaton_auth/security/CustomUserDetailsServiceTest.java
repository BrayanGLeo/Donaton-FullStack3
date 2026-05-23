package com.donaton.donaton_auth.security;

import com.donaton.donaton_auth.entity.Usuario;
import com.donaton.donaton_auth.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    private Usuario usuarioPrueba;

    @BeforeEach
    void setUp() {
        usuarioPrueba = new Usuario();
        usuarioPrueba.setEmail("test@donaton.cl");
        usuarioPrueba.setPassword("123456");
        usuarioPrueba.setRol("ADMIN");
    }

    @Test
    void testLoadUserByUsername_UserExists() {
        // Simular que el repositorio encuentra al usuario
        when(usuarioRepository.findByEmail("test@donaton.cl")).thenReturn(Optional.of(usuarioPrueba));

        UserDetails userDetails = customUserDetailsService.loadUserByUsername("test@donaton.cl");

        assertNotNull(userDetails);
        assertEquals("test@donaton.cl", userDetails.getUsername());
        assertEquals("123456", userDetails.getPassword());
    }

    @Test
    void testLoadUserByUsername_UserNotFound_ThrowsException() {
        // Simular que el repositorio NO encuentra al usuario
        when(usuarioRepository.findByEmail("noexiste@donaton.cl")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> {
            customUserDetailsService.loadUserByUsername("noexiste@donaton.cl");
        });
    }
}