package com.donaton.logistica.repository;

import com.donaton.logistica.entity.Despacho;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface DespachoRepository extends JpaRepository<Despacho, Long> {
    
    boolean existsByVehiculoAndHorario(String vehiculo, LocalDateTime horario);
}
