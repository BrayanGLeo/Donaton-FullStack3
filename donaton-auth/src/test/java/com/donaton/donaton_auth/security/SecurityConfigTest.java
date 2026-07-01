package com.donaton.donaton_auth.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.context.ApplicationContext;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(classes = SecurityConfig.class)
class SecurityConfigTest {

    @Autowired
    private ApplicationContext context;

    @Test
    void testSecurityBeansAreLoaded() {
        SecurityFilterChain securityFilterChain = context.getBean(SecurityFilterChain.class);
        assertNotNull(securityFilterChain, "SecurityFilterChain bean should be loaded");

        PasswordEncoder passwordEncoder = context.getBean(PasswordEncoder.class);
        assertNotNull(passwordEncoder, "PasswordEncoder bean should be loaded");
    }
}
