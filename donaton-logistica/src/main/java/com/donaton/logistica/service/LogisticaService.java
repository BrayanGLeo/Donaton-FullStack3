package com.donaton.logistica.service;

import com.donaton.logistica.dto.DonacionEventDTO;
import com.donaton.logistica.entity.Inventario;
import com.donaton.logistica.repository.InventarioRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class LogisticaService {

    private final InventarioRepository inventarioRepository;

    public LogisticaService(InventarioRepository inventarioRepository) {
        this.inventarioRepository = inventarioRepository;
    }

    @RabbitListener(queues = "donacion_creada_queue")
    public void procesarDonacion(DonacionEventDTO evento) {
        Optional<Inventario> inventarioOpt = inventarioRepository.findByRecurso(evento.getRecurso());

        Inventario inventario;
        if (inventarioOpt.isPresent()) {
            inventario = inventarioOpt.get();
            inventario.setCantidadTotal(inventario.getCantidadTotal() + evento.getCantidad());
        } else {
            inventario = new Inventario(evento.getRecurso(), evento.getCantidad());
        }

        inventarioRepository.save(inventario);
        System.out.println("Donación procesada en logística: Recurso=" + inventario.getRecurso() + ", Cantidad Total=" + inventario.getCantidadTotal());
    }
}
