package com.donaton.logistica.controller;

import com.donaton.logistica.entity.CentroAcopio;
import com.donaton.logistica.repository.CentroAcopioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CentroAcopioControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CentroAcopioRepository centroAcopioRepository;

    @InjectMocks
    private CentroAcopioController centroAcopioController;

    private CentroAcopio centroAcopio;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(centroAcopioController).build();
        centroAcopio = new CentroAcopio();
        centroAcopio.setId(1L);
        centroAcopio.setNombre("Centro Central");
        centroAcopio.setRegion("RM");
        centroAcopio.setComuna("Santiago");
    }

    @Test
    void testObtenerTodos() throws Exception {
        when(centroAcopioRepository.findAll()).thenReturn(List.of(centroAcopio));

        mockMvc.perform(get("/api/logistica/centros-acopio"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("Centro Central"));
    }

    @Test
    void testObtenerPorRegion() throws Exception {
        when(centroAcopioRepository.findByRegion("RM")).thenReturn(List.of(centroAcopio));

        mockMvc.perform(get("/api/logistica/centros-acopio/region/RM"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].region").value("RM"));
    }
}
