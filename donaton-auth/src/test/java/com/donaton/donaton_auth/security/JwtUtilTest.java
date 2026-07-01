package com.donaton.donaton_auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private final String secret = "default_super_secret_key_that_is_long_enough_for_hs256_1234567890";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secretKey", secret);
    }

    private Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secret.getBytes())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    @Test
    void testGenerateToken_EmailAndRol() {
        String token = jwtUtil.generateToken("test@donaton.cl", "ADMIN");
        assertNotNull(token);

        Claims claims = parseToken(token);
        assertEquals("test@donaton.cl", claims.getSubject());
        assertEquals("ADMIN", claims.get("rol"));
    }

    @Test
    void testGenerateToken_EmailRolRememberMe() {
        String token = jwtUtil.generateToken("test@donaton.cl", "ADMIN", true);
        assertNotNull(token);

        Claims claims = parseToken(token);
        assertEquals("test@donaton.cl", claims.getSubject());
        assertEquals("ADMIN", claims.get("rol"));
        
        long expirationTime = claims.getExpiration().getTime() - claims.getIssuedAt().getTime();
        assertTrue(expirationTime > 86400000); // More than 1 day, it should be 7 days
    }

    @Test
    void testGenerateToken_EmailRolUserId() {
        String token = jwtUtil.generateToken("test@donaton.cl", "ADMIN", 123L);
        assertNotNull(token);

        Claims claims = parseToken(token);
        assertEquals("test@donaton.cl", claims.getSubject());
        assertEquals("ADMIN", claims.get("rol"));
        assertEquals(123, claims.get("userId", Integer.class)); // Jackson might parse Long as Integer if small
    }

    @Test
    void testGenerateToken_EmailRolUserIdRememberMe() {
        String token = jwtUtil.generateToken("test@donaton.cl", "ADMIN", 123L, true);
        assertNotNull(token);

        Claims claims = parseToken(token);
        assertEquals("test@donaton.cl", claims.getSubject());
        assertEquals("ADMIN", claims.get("rol"));
        assertEquals(123, claims.get("userId", Integer.class));
        
        long expirationTime = claims.getExpiration().getTime() - claims.getIssuedAt().getTime();
        assertTrue(expirationTime > 86400000); // 7 days
    }
}
