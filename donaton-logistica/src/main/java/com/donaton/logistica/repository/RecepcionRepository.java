package com.donaton.logistica.repository;

import com.donaton.logistica.entity.Recepcion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RecepcionRepository extends JpaRepository<Recepcion, Long> {
    List<Recepcion> findByTrackingId(String trackingId);
}
