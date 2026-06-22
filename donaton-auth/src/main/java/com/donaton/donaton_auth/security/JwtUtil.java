package com.donaton.donaton_auth.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${jwt.secret:default_super_secret_key_that_is_long_enough_for_hs256_1234567890}")
    private String secretKey;
    
    private static final long EXPIRATION_TIME = 86400000;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public String generateToken(String email, String rol) {
        return generateToken(email, rol, false);
    }

    public String generateToken(String email, String rol, boolean rememberMe) {
        long expiration = rememberMe ? EXPIRATION_TIME * 7 : EXPIRATION_TIME;
        return Jwts.builder()
                .setSubject(email)
                .claim("rol", rol)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateToken(String email, String rol, Long userId) {
        return generateToken(email, rol, userId, false);
    }

    public String generateToken(String email, String rol, Long userId, boolean rememberMe) {
        long expiration = rememberMe ? EXPIRATION_TIME * 7 : EXPIRATION_TIME;
        return Jwts.builder()
                .setSubject(email)
                .claim("rol", rol)
                .claim("userId", userId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
}