package com.donaton.donaton_donaciones.service;

import com.donaton.donaton_donaciones.config.RabbitMQConfig;
import com.donaton.donaton_donaciones.entity.Donacion;
import com.donaton.donaton_donaciones.repository.DonacionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DonacionServiceTest {

    @Mock
    private DonacionRepository repository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private DonacionService donacionService;

    private Donacion donacionEntrada;
    private Donacion donacionGuardada;

    @BeforeEach
    void setUp() {
        donacionEntrada = new Donacion();
        donacionEntrada.setRecurso("Agua Embotellada");
        donacionEntrada.setCantidad(100);
        donacionEntrada.setOrigen("Centro de Santiago");

        donacionGuardada = new Donacion();
        donacionGuardada.setId(1L);
        donacionGuardada.setRecurso("Agua Embotellada");
        donacionGuardada.setCantidad(100);
        donacionGuardada.setOrigen("Centro de Santiago");
        donacionGuardada.setEstado("Pendiente");
        donacionGuardada.setFechaRegistro(LocalDateTime.now());
    }

    @Test
    void testRegistrarDonacion() {
        when(repository.save(any(Donacion.class))).thenReturn(donacionGuardada);

        Donacion resultado = donacionService.registrarDonacion(donacionEntrada);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
        assertEquals("Pendiente", resultado.getEstado());
        assertNotNull(resultado.getFechaRegistro());

        verify(repository).save(donacionEntrada);
        verify(rabbitTemplate).convertAndSend(
                eq(RabbitMQConfig.EXCHANGE),
                eq(RabbitMQConfig.ROUTING_KEY),
                eq(donacionGuardada)
        );
    }

    @Test
    void testObtenerTodas() {
        List<Donacion> listaSimulada = Arrays.asList(donacionGuardada);
        when(repository.findAll()).thenReturn(listaSimulada);

        List<Donacion> resultado = donacionService.obtenerTodas();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("Agua Embotellada", resultado.get(0).getRecurso());
        
        verify(repository).findAll();
    }
}