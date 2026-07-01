package com.donaton.donaton_bff.controller;

import com.donaton.donaton_bff.client.NecesidadesClient;
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
class NecesidadesProxyControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @MockitoBean
    private NecesidadesClient necesidadesClient;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void testReportarNecesidad() throws Exception {
        when(necesidadesClient.reportarNecesidad(any())).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(post("/api/necesidades")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk());
    }

    @Test
    void testListarNecesidades() throws Exception {
        when(necesidadesClient.listarNecesidades()).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(get("/api/necesidades"))
                .andExpect(status().isOk());
    }
}
