package com.donaton.donaton_auth.config;

import com.donaton.donaton_auth.entity.Usuario;
import com.donaton.donaton_auth.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (repository.count() == 0) {
                Usuario testUser = new Usuario();
                testUser.setEmail("admin@donaton.cl");
                testUser.setPassword(passwordEncoder.encode("123456"));
                testUser.setRol("ADMIN");
                
                repository.save(testUser);
                System.out.println("Usuario de prueba creado: admin@donaton.cl / 123456");
            }
        };
    }
}