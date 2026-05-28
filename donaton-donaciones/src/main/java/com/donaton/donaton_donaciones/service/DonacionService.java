package com.donaton.donaton_donaciones.service;

import com.donaton.donaton_donaciones.config.RabbitMQConfig;
import com.donaton.donaton_donaciones.entity.Donacion;
import com.donaton.donaton_donaciones.repository.DonacionRepository;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DonacionService {

    private final DonacionRepository repository;
    private final AmqpTemplate rabbitTemplate;

    public DonacionService(DonacionRepository repository, AmqpTemplate rabbitTemplate) {
        this.repository = repository;
        this.rabbitTemplate = rabbitTemplate;
    }

    public Donacion registrarDonacion(Donacion donacion) {
        donacion.setEstado("Pendiente");
        donacion.setFechaRegistro(LocalDateTime.now());
        donacion.setTrackingId("DON-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        
        Donacion donacionGuardada = repository.save(donacion);
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY, donacionGuardada);
        
        return donacionGuardada;
    }

    public List<Donacion> obtenerTodas() {
        return repository.findAll();
    }

    public Donacion actualizarEstado(Long id, String nuevoEstado) {
        Donacion donacion = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Donación no encontrada con ID: " + id));
        donacion.setEstado(nuevoEstado);
        return repository.save(donacion);
    }
}