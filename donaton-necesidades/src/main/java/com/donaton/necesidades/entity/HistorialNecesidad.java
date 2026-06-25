package com.donaton.necesidades.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "historial_necesidades")
public class HistorialNecesidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long necesidadId;
    private String categoria;
    private Double cantidad;
    private String unidad;
    private LocalDateTime fechaCubierta;
    private String region;
    private String comuna;
    private Long centroAcopioId;

    public HistorialNecesidad() {
        // Constructor vacío requerido por JPA
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getNecesidadId() { return necesidadId; }
    public void setNecesidadId(Long necesidadId) { this.necesidadId = necesidadId; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public Double getCantidad() { return cantidad; }
    public void setCantidad(Double cantidad) { this.cantidad = cantidad; }

    public String getUnidad() { return unidad; }
    public void setUnidad(String unidad) { this.unidad = unidad; }

    public LocalDateTime getFechaCubierta() { return fechaCubierta; }
    public void setFechaCubierta(LocalDateTime fechaCubierta) { this.fechaCubierta = fechaCubierta; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getComuna() { return comuna; }
    public void setComuna(String comuna) { this.comuna = comuna; }

    public Long getCentroAcopioId() { return centroAcopioId; }
    public void setCentroAcopioId(Long centroAcopioId) { this.centroAcopioId = centroAcopioId; }
}
