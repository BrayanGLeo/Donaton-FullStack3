package com.donaton.necesidades.controller;

import com.donaton.necesidades.dto.NecesidadRequestDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.test.context.TestPropertySource;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driverClassName=org.h2.Driver",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "eureka.client.enabled=false"
})
class NecesidadControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testReportarNecesidadExitoso() throws Exception {
        NecesidadRequestDTO request = new NecesidadRequestDTO("Agua y Mantas", -33.4489, -70.6693, "Región Metropolitana", "Santiago", "Inundación");

        mockMvc.perform(post("/api/necesidades")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.recursos").value("Agua y Mantas"));
    }

    @Test
    void testFallaCoordenadasFueraDeLimite() throws Exception {
        NecesidadRequestDTO request = new NecesidadRequestDTO("Medicamentos", 150.0, -70.6693, "Región Metropolitana", "Santiago", "Terremoto");

        mockMvc.perform(post("/api/necesidades")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Coordenadas inválidas o fuera del límite"));
    }

    @Test
    void testFallaFaltanRecursos() throws Exception {
        NecesidadRequestDTO request = new NecesidadRequestDTO("", -33.4489, -70.6693, "Región Metropolitana", "Santiago", "Terremoto");

        mockMvc.perform(post("/api/necesidades")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Coordenadas inválidas o fuera del límite"));
    }

    @Test
    void testFallaFaltaLatitud() throws Exception {
        NecesidadRequestDTO request = new NecesidadRequestDTO("Medicamentos", null, -70.6693, "Región Metropolitana", "Santiago", "General");

        mockMvc.perform(post("/api/necesidades")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Coordenadas inválidas o fuera del límite"));
    }
}
