package com.donaton.donaton_donaciones.controller;

import com.donaton.donaton_donaciones.entity.Donacion;
import com.donaton.donaton_donaciones.service.DonacionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DonacionController.class)
class DonacionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DonacionService donacionService;

    @Autowired
    private ObjectMapper objectMapper;

    private Donacion donacionMock;

    @BeforeEach
    void setUp() {
        donacionMock = new Donacion(
                1L,
                "Mantas",
                50,
                "Concepción",
                "Pendiente",
                LocalDateTime.now()
        );
    }

    @Test
    void testRegistrarDonacionEndpoint() throws Exception {
        when(donacionService.registrarDonacion(any(Donacion.class))).thenReturn(donacionMock);

        Donacion peticionNueva = new Donacion();
        peticionNueva.setRecurso("Mantas");
        peticionNueva.setCantidad(50);
        peticionNueva.setOrigen("Concepción");

        mockMvc.perform(post("/api/donaciones")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(peticionNueva)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.recurso").value("Mantas"))
                .andExpect(jsonPath("$.estado").value("Pendiente"));
    }
}