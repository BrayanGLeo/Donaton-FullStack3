package com.donaton.donaton_donaciones.service;

import com.donaton.donaton_donaciones.config.RabbitMQConfig;
import com.donaton.donaton_donaciones.entity.Donacion;
import com.donaton.donaton_donaciones.repository.DonacionRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DonacionService {

    private final DonacionRepository repository;
    private final RabbitTemplate rabbitTemplate;

    public DonacionService(DonacionRepository repository, RabbitTemplate rabbitTemplate) {
        this.repository = repository;
        this.rabbitTemplate = rabbitTemplate;
    }

    public Donacion registrarDonacion(Donacion donacion) {
        donacion.setEstado("Pendiente");
        donacion.setFechaRegistro(LocalDateTime.now());
        
        Donacion donacionGuardada = repository.save(donacion);
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY, donacionGuardada);
        
        return donacionGuardada;
    }

    public List<Donacion> obtenerTodas() {
        return repository.findAll();
    }
}