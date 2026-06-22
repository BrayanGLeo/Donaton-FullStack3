package com.donaton.necesidades.repository;

import com.donaton.necesidades.entity.Necesidad;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NecesidadRepository extends JpaRepository<Necesidad, Long> {
}
