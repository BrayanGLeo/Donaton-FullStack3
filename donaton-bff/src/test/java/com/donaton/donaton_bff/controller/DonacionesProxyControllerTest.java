package com.donaton.donaton_bff.controller;

import com.donaton.donaton_bff.client.DonacionesClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class DonacionesProxyControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @MockitoBean
    private DonacionesClient donacionesClient;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void testRegistrarDonacion() throws Exception {
        when(donacionesClient.registrarDonacion(any())).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(post("/api/donaciones")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk());
    }

    @Test
    void testListarDonaciones() throws Exception {
        when(donacionesClient.listarDonaciones()).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(get("/api/donaciones"))
                .andExpect(status().isOk());
    }

    @Test
    void testActualizarEstado() throws Exception {
        when(donacionesClient.actualizarEstado(eq(1L), any())).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(put("/api/donaciones/1/estado")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk());
    }

    @Test
    void testAsignarConductor() throws Exception {
        when(donacionesClient.asignarConductor(1L, 2L)).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(put("/api/donaciones/1/conductor/2"))
                .andExpect(status().isOk());
    }
}
