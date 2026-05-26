package com.donaton.logistica.repository;

import com.donaton.logistica.entity.Recepcion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RecepcionRepository extends JpaRepository<Recepcion, Long> {
    Optional<Recepcion> findByTrackingId(String trackingId);
}
