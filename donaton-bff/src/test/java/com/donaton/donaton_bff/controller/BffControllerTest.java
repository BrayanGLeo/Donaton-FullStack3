package com.donaton.donaton_bff.controller;

import com.donaton.donaton_bff.service.NecesidadesClientService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class BffControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @MockitoBean
    private NecesidadesClientService necesidadesClientService;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void testObtenerNecesidades() throws Exception {
        when(necesidadesClientService.obtenerNecesidades())
                .thenReturn(ResponseEntity.ok("[{\"id\":1}]"));

        mockMvc.perform(get("/api/bff/necesidades"))
                .andExpect(status().isOk())
                .andExpect(content().json("[{\"id\":1}]"));
    }

    @Test
    void testActualizarEstadoNecesidad() throws Exception {
        when(necesidadesClientService.actualizarEstadoNecesidad(eq(1L), any()))
                .thenReturn(ResponseEntity.ok("{\"estado\":\"Cubierta\"}"));

        mockMvc.perform(put("/api/bff/necesidades/1/estado")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"estado\":\"Cubierta\"}"))
                .andExpect(status().isOk())
                .andExpect(content().json("{\"estado\":\"Cubierta\"}"));
    }

    @Test
    void testObtenerHistorialNecesidades() throws Exception {
        when(necesidadesClientService.obtenerHistorialNecesidades())
                .thenReturn(ResponseEntity.ok("[{\"categoria\":\"Agua\"}]"));

        mockMvc.perform(get("/api/bff/necesidades/historial"))
                .andExpect(status().isOk())
                .andExpect(content().json("[{\"categoria\":\"Agua\"}]"));
    }
}
