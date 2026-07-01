package com.donaton.necesidades.controller;

import com.donaton.necesidades.dto.NecesidadRequestDTO;
import com.donaton.necesidades.entity.HistorialNecesidad;
import com.donaton.necesidades.entity.Necesidad;
import com.donaton.necesidades.service.NecesidadService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
class NecesidadControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @MockitoBean
    private NecesidadService necesidadService;

    @Autowired
    private ObjectMapper objectMapper;

    private Necesidad necesidad;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        necesidad = new Necesidad("[{\"categoria\":\"Agua\",\"cantidad\":10}]", -33.4, -70.6, null, "RM", "Santiago", "Incendio");
        necesidad.setId(1L);
        necesidad.setEstado("Pendiente");
    }

    @Test
    void testReportarNecesidad() throws Exception {
        NecesidadRequestDTO request = new NecesidadRequestDTO();
        request.setRecursos("[{\"categoria\":\"Agua\",\"cantidad\":10}]");
        request.setLatitud(-33.4);
        request.setLongitud(-70.6);
        request.setRegion("RM");
        request.setComuna("Santiago");
        request.setTipoEmergencia("Incendio");

        when(necesidadService.reportarNecesidad(any(NecesidadRequestDTO.class))).thenReturn(necesidad);

        mockMvc.perform(post("/api/necesidades")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.region").value("RM"));
    }

    @Test
    void testObtenerNecesidades() throws Exception {
        when(necesidadService.obtenerTodas()).thenReturn(List.of(necesidad));

        mockMvc.perform(get("/api/necesidades"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].region").value("RM"));
    }

    @Test
    void testActualizarEstado() throws Exception {
        necesidad.setEstado("Cubierta");
        when(necesidadService.actualizarEstado(1L, "Cubierta", "10", "20")).thenReturn(necesidad);

        Map<String, String> payload = Map.of(
                "estado", "Cubierta",
                "centroAcopioId", "10",
                "conductorId", "20"
        );

        mockMvc.perform(put("/api/necesidades/1/estado")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("Cubierta"));
    }

    @Test
    void testObtenerHistorial() throws Exception {
        HistorialNecesidad h = new HistorialNecesidad();
        h.setCategoria("Agua");
        when(necesidadService.obtenerHistorial()).thenReturn(List.of(h));

        mockMvc.perform(get("/api/necesidades/historial"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].categoria").value("Agua"));
    }
}
