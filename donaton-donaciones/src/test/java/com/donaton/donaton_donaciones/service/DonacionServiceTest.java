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
import org.springframework.amqp.core.AmqpTemplate;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DonacionServiceTest {

    @Mock
    private DonacionRepository repository;

    @Mock
    private AmqpTemplate rabbitTemplate;

    @InjectMocks
    private DonacionService donacionService;

    private Donacion donacionEntrada;
    private Donacion donacionGuardada;

    @BeforeEach
    void setUp() {
        donacionEntrada = new Donacion();
        donacionEntrada.setRecursos("[{\"recurso\":\"Agua Embotellada\",\"cantidad\":100}]");
        donacionEntrada.setOrigen("Centro de Santiago");

        donacionGuardada = new Donacion();
        donacionGuardada.setId(1L);
        donacionGuardada.setRecursos("[{\"recurso\":\"Agua Embotellada\",\"cantidad\":100}]");
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
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.ROUTING_KEY,
                donacionGuardada
        );
    }

    @Test
    void testObtenerTodas() {
        List<Donacion> listaSimulada = Arrays.asList(donacionGuardada);
        when(repository.findAll()).thenReturn(listaSimulada);

        List<Donacion> resultado = donacionService.obtenerTodas();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("[{\"recurso\":\"Agua Embotellada\",\"cantidad\":100}]", resultado.get(0).getRecursos());
        
        verify(repository).findAll();
    }

    @Test
    void testActualizarEstadoNoRecibido() {
        when(repository.findById(1L)).thenReturn(java.util.Optional.of(donacionGuardada));
        when(repository.save(any(Donacion.class))).thenReturn(donacionGuardada);

        Donacion resultado = donacionService.actualizarEstado(1L, "EN TRANSITO");

        assertEquals("EN TRANSITO", resultado.getEstado());
        verify(repository).save(donacionGuardada);
        // Verificar que no se envía mensaje para estados diferentes a RECIBIDO
        verify(rabbitTemplate, org.mockito.Mockito.never()).convertAndSend(
                org.mockito.ArgumentMatchers.eq(RabbitMQConfig.EXCHANGE),
                org.mockito.ArgumentMatchers.eq(RabbitMQConfig.ROUTING_KEY_RECIBIDA),
                any(Donacion.class)
        );
    }

    @Test
    void testActualizarEstadoRecibido() {
        when(repository.findById(1L)).thenReturn(java.util.Optional.of(donacionGuardada));
        when(repository.save(any(Donacion.class))).thenReturn(donacionGuardada);

        Donacion resultado = donacionService.actualizarEstado(1L, "RECIBIDO");

        assertEquals("RECIBIDO", resultado.getEstado());
        verify(repository).save(donacionGuardada);
        verify(rabbitTemplate).convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.ROUTING_KEY_RECIBIDA,
                donacionGuardada
        );
    }
}