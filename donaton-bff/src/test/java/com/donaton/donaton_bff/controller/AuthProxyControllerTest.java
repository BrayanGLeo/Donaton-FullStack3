package com.donaton.donaton_bff.controller;

import com.donaton.donaton_bff.client.AuthClient;
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
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class AuthProxyControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @MockitoBean
    private AuthClient authClient;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void testLogin() throws Exception {
        when(authClient.login(any())).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk());
    }

    @Test
    void testRegistrarDonante() throws Exception {
        when(authClient.registrarDonante(any())).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(post("/api/auth/registro")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk());
    }

    @Test
    void testRegistrarAdmin() throws Exception {
        when(authClient.registrarAdmin(any())).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(post("/api/auth/admin/registro")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk());
    }

    @Test
    void testObtenerUsuarios() throws Exception {
        when(authClient.obtenerUsuarios(isNull(), isNull(), isNull(), isNull(), isNull(), isNull(), eq(0), eq(10), eq("id"), eq("asc")))
                .thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(get("/api/auth/usuarios"))
                .andExpect(status().isOk());
    }

    @Test
    void testObtenerStats() throws Exception {
        when(authClient.obtenerStats()).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(get("/api/auth/admin/usuarios/stats"))
                .andExpect(status().isOk());
    }

    @Test
    void testForgotPassword() throws Exception {
        when(authClient.forgotPassword(any())).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk());
    }

    @Test
    void testVerifyCode() throws Exception {
        when(authClient.verifyCode(any())).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(post("/api/auth/verify-code")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk());
    }

    @Test
    void testResetPassword() throws Exception {
        when(authClient.resetPassword(any())).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk());
    }

    @Test
    void testActualizarUsuario() throws Exception {
        when(authClient.actualizarUsuario(eq(1L), any())).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(put("/api/auth/admin/usuarios/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk());
    }

    @Test
    void testEliminarUsuario() throws Exception {
        when(authClient.eliminarUsuario(1L)).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(delete("/api/auth/admin/usuarios/1"))
                .andExpect(status().isOk());
    }

    @Test
    void testReactivarUsuario() throws Exception {
        when(authClient.reactivarUsuario(1L)).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(put("/api/auth/admin/usuarios/1/reactivar"))
                .andExpect(status().isOk());
    }

    @Test
    void testActualizarEstadoMasivo() throws Exception {
        when(authClient.actualizarEstadoMasivo(any())).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(put("/api/auth/admin/usuarios/bulk-status")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk());
    }

    @Test
    void testCambiarPassword() throws Exception {
        when(authClient.cambiarPassword(eq(1L), any())).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(put("/api/auth/usuarios/1/password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk());
    }
}
