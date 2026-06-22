package com.donaton.donaton_donaciones.repository;

import com.donaton.donaton_donaciones.entity.Donacion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonacionRepository extends JpaRepository<Donacion, Long> {
}