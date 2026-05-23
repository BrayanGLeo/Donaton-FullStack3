package com.donaton.donaton_auth.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;

class JwtUtilTest {

    private final JwtUtil jwtUtil = new JwtUtil();

    @Test
    void testGenerateToken() {
        // Arrange
        String email = "test@donaton.cl";
        String rol = "ADMIN";

        // Act
        String token = jwtUtil.generateToken(email, rol);

        // Assert
        assertNotNull(token);
        assertFalse(token.isEmpty());
        // Un JWT válido tiene 3 partes separadas por puntos
        assertEquals(3, token.split("\\.").length); 
    }
}