package com.donaton.donaton_donaciones.controller;

import com.donaton.donaton_donaciones.entity.Donacion;
import com.donaton.donaton_donaciones.service.DonacionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DonacionControllerTest {
    
    private static final String RECURSO_MANTAS = "Mantas";
    private static final String ESTADO_PENDIENTE = "Pendiente";

    private MockMvc mockMvc;

    @Mock
    private DonacionService donacionService;

    @Mock
    private com.donaton.donaton_donaciones.security.JwtUtil jwtUtil;

    @InjectMocks
    private DonacionController donacionController;

    private ObjectMapper objectMapper;

    private Donacion donacionMock;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(donacionController).build();
        objectMapper = new ObjectMapper();
        
        donacionMock = new Donacion();
        donacionMock.setId(1L);
        donacionMock.setRecurso(RECURSO_MANTAS);
        donacionMock.setCantidad(50);
        donacionMock.setOrigen("Concepción");
        donacionMock.setEstado(ESTADO_PENDIENTE);
        donacionMock.setFechaRegistro(LocalDateTime.now());
    }

    @Test
    void testRegistrarDonacionEndpoint() throws Exception {
        when(donacionService.registrarDonacion(any(Donacion.class))).thenReturn(donacionMock);

        com.donaton.donaton_donaciones.dto.DonacionRequest peticionNueva = new com.donaton.donaton_donaciones.dto.DonacionRequest();
        peticionNueva.setRecurso(RECURSO_MANTAS);
        peticionNueva.setCantidad(50);
        peticionNueva.setOrigen("Concepción");

        mockMvc.perform(post("/api/donaciones")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(peticionNueva)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.recurso").value(RECURSO_MANTAS))
                .andExpect(jsonPath("$.estado").value(ESTADO_PENDIENTE));
    }

    @Test
    void testListarDonacionesEndpoint() throws Exception {
        List<Donacion> listaMock = Arrays.asList(donacionMock);
        when(donacionService.obtenerTodas()).thenReturn(listaMock);

        mockMvc.perform(get("/api/donaciones")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].recurso").value(RECURSO_MANTAS))
                .andExpect(jsonPath("$[0].estado").value(ESTADO_PENDIENTE));
    }

    @Test
    void testActualizarEstadoEndpoint() throws Exception {
        Donacion donacionActualizada = new Donacion();
        donacionActualizada.setId(1L);
        donacionActualizada.setRecurso(RECURSO_MANTAS);
        donacionActualizada.setEstado("EN TRANSITO");

        when(donacionService.actualizarEstado(1L, "EN TRANSITO")).thenReturn(donacionActualizada);

        java.util.Map<String, String> body = new java.util.HashMap<>();
        body.put("estado", "EN TRANSITO");

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/donaciones/1/estado")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.estado").value("EN TRANSITO"));
    }

}