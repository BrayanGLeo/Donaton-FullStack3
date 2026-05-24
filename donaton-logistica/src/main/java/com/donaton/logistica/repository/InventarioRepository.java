package com.donaton.logistica.repository;

import com.donaton.logistica.entity.Inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface InventarioRepository extends JpaRepository<Inventario, Long> {
    Optional<Inventario> findByRecurso(String recurso);
}
