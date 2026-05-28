package com.donaton.donaton_auth.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;

class JwtUtilTest {

    private final JwtUtil jwtUtil = new JwtUtil();

    @Test
    void testGenerateToken() {
        String email = "test@donaton.cl";
        String rol = "ADMIN";
        org.springframework.test.util.ReflectionTestUtils.setField(jwtUtil, "secretKey", "donaton_secreto_super_seguro_nueva_clave_2026_muy_largo_para_hs256");

        String token = jwtUtil.generateToken(email, rol);

        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertEquals(3, token.split("\\.").length); 
    }
}