package com.donaton.logistica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.donaton.logistica.entity.CentroAcopio;

import java.util.List;

@Repository
public interface CentroAcopioRepository extends JpaRepository<CentroAcopio, Long> {
    List<CentroAcopio> findByRegion(String region);
}
