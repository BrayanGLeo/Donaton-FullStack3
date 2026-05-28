package com.donaton.donaton_auth.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.donaton.donaton_auth.entity.Usuario;
import com.donaton.donaton_auth.repository.UsuarioRepository;

@Configuration
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    CommandLineRunner initDatabase(UsuarioRepository repository, PasswordEncoder passwordEncoder, DonatonAdminProperties adminProps) {
        return args -> {
            if (repository.count() == 0) {
                Usuario testUser = new Usuario();
                testUser.setEmail("admin@donaton.cl");

                testUser.setPassword(passwordEncoder.encode(adminProps.getPassword()));
                testUser.setRol("ADMIN");

                repository.save(testUser);

                logger.info("Usuario de prueba creado: admin@donaton.cl");
            }
        };
    }
}