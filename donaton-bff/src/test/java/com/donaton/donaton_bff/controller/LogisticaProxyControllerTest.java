package com.donaton.donaton_bff.controller;

import com.donaton.donaton_bff.client.LogisticaClient;
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

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class LogisticaProxyControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @MockitoBean
    private LogisticaClient logisticaClient;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void testListarInventario() throws Exception {
        when(logisticaClient.listarInventario()).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(get("/api/logistica/inventario"))
                .andExpect(status().isOk());
    }

    @Test
    void testConsumirInventario() throws Exception {
        when(logisticaClient.consumirInventario(any())).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(post("/api/logistica/inventario/consumir")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk());
    }

    @Test
    void testRegistrarIngreso() throws Exception {
        when(logisticaClient.registrarIngreso("TRK-123")).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(put("/api/logistica/ingreso/TRK-123"))
                .andExpect(status().isOk());
    }

    @Test
    void testAsignarTransporte() throws Exception {
        when(logisticaClient.asignarTransporte(any())).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(post("/api/logistica/despachos")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk());
    }

    @Test
    void testListarDespachos() throws Exception {
        when(logisticaClient.listarDespachos()).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(get("/api/logistica/despachos"))
                .andExpect(status().isOk());
    }

    @Test
    void testConfirmarEntrega() throws Exception {
        when(logisticaClient.confirmarEntrega(1L)).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(put("/api/logistica/despachos/1/entrega"))
                .andExpect(status().isOk());
    }

    @Test
    void testListarCentrosAcopio() throws Exception {
        when(logisticaClient.listarCentrosAcopio()).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(get("/api/logistica/centros-acopio"))
                .andExpect(status().isOk());
    }

    @Test
    void testObtenerCentrosPorRegion() throws Exception {
        when(logisticaClient.obtenerCentrosPorRegion("RM")).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(get("/api/logistica/centros-acopio/region/RM"))
                .andExpect(status().isOk());
    }
}
