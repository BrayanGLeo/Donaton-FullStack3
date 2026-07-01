package com.donaton.donaton_donaciones.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Key;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private String secret = "default_super_secret_key_that_is_long_enough_for_hs256_1234567890";
    private Key key;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secretKey", secret);
        key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    @Test
    void testExtractUserId_Success() {
        String token = Jwts.builder()
                .claim("userId", 123L)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 10000))
                .signWith(key)
                .compact();

        Long extractedId = jwtUtil.extractUserId(token);
        assertEquals(123L, extractedId);
    }

    @Test
    void testExtractUserId_AsLong() {
        String token = Jwts.builder()
                .claim("userId", 9999999999L) // Forces Long
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 10000))
                .signWith(key)
                .compact();
        Long extractedId = jwtUtil.extractUserId(token);
        assertEquals(9999999999L, extractedId);
    }

    @Test
    void testExtractUserId_AsString() {
        String token = Jwts.builder()
                .claim("userId", "123")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 10000))
                .signWith(key)
                .compact();
        Long extractedId = jwtUtil.extractUserId(token);
        assertEquals(123L, extractedId);
    }

    @Test
    void testExtractUserId_NullUserId() {
        String token = Jwts.builder()
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 10000))
                .signWith(key)
                .compact();
        Long extractedId = jwtUtil.extractUserId(token);
        assertNull(extractedId);
    }

    @Test
    void testExtractUserId_InvalidToken() {
        String token = "invalid_token_string";
        Long extractedId = jwtUtil.extractUserId(token);
        assertNull(extractedId);
    }
}
