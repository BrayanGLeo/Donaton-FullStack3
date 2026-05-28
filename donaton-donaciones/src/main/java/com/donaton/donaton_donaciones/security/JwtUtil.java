package com.donaton.donaton_donaciones.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;

@Component
public class JwtUtil {

    @Value("${jwt.secret:default_super_secret_key_that_is_long_enough_for_hs256_1234567890}")
    private String secretKey;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public Long extractUserId(String token) {
        try {
            Claims claims = parseToken(token);
            Object userId = claims.get("userId");
            if (userId instanceof Integer integer) return integer.longValue();
            if (userId instanceof Long l) return l;
            if (userId != null) return Long.parseLong(userId.toString());
        } catch (Exception e) {
            // ignore, return null
        }
        return null;
    }
}
