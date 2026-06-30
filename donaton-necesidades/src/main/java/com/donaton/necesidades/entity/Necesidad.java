package com.donaton.necesidades.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "necesidades")
public class Necesidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String recursos;

    private Double latitud;

    private Double longitud;

    private LocalDateTime fechaReporte;

    private LocalDateTime fechaActualizacion;

    private String estado = "Pendiente";

    private String region;

    private String comuna;

    private String tipoEmergencia;

    private Long conductorId;

    private Long coordinadorId;

    private Long centroAcopioId;

    public Necesidad() {
        // Constructor vacío requerido por JPA
    }

    public Necesidad(String recursos, Double latitud, Double longitud, LocalDateTime fechaReporte, String region, String comuna, String tipoEmergencia) {
        this.recursos = recursos;
        this.latitud = latitud;
        this.longitud = longitud;
        this.fechaReporte = fechaReporte;
        this.region = region;
        this.comuna = comuna;
        this.tipoEmergencia = tipoEmergencia;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRecursos() {
        return recursos;
    }

    public void setRecursos(String recursos) {
        this.recursos = recursos;
    }

    public Double getLatitud() {
        return latitud;
    }

    public void setLatitud(Double latitud) {
        this.latitud = latitud;
    }

    public Double getLongitud() {
        return longitud;
    }

    public void setLongitud(Double longitud) {
        this.longitud = longitud;
    }

    public LocalDateTime getFechaReporte() {
        return fechaReporte;
    }

    public void setFechaReporte(LocalDateTime fechaReporte) {
        this.fechaReporte = fechaReporte;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getComuna() {
        return comuna;
    }

    public void setComuna(String comuna) {
        this.comuna = comuna;
    }

    public String getTipoEmergencia() {
        return tipoEmergencia;
    }

    public void setTipoEmergencia(String tipoEmergencia) {
        this.tipoEmergencia = tipoEmergencia;
    }

    public Long getConductorId() {
        return conductorId;
    }

    public void setConductorId(Long conductorId) {
        this.conductorId = conductorId;
    }

    public Long getCoordinadorId() {
        return coordinadorId;
    }

    public void setCoordinadorId(Long coordinadorId) {
        this.coordinadorId = coordinadorId;
    }

    public Long getCentroAcopioId() {
        return centroAcopioId;
    }

    public void setCentroAcopioId(Long centroAcopioId) {
        this.centroAcopioId = centroAcopioId;
    }
}
