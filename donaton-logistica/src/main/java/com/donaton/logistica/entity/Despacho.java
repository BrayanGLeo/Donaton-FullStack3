package com.donaton.logistica.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "despachos")
public class Despacho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long inventarioId;
    
    private Integer cantidadDespachada;
    
    private String vehiculo;
    
    private LocalDateTime horario;
    
    private String estado;

    public Despacho() {
    }

    public Despacho(Long inventarioId, Integer cantidadDespachada, String vehiculo, LocalDateTime horario, String estado) {
        this.inventarioId = inventarioId;
        this.cantidadDespachada = cantidadDespachada;
        this.vehiculo = vehiculo;
        this.horario = horario;
        this.estado = estado;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getInventarioId() {
        return inventarioId;
    }

    public void setInventarioId(Long inventarioId) {
        this.inventarioId = inventarioId;
    }

    public Integer getCantidadDespachada() {
        return cantidadDespachada;
    }

    public void setCantidadDespachada(Integer cantidadDespachada) {
        this.cantidadDespachada = cantidadDespachada;
    }

    public String getVehiculo() {
        return vehiculo;
    }

    public void setVehiculo(String vehiculo) {
        this.vehiculo = vehiculo;
    }

    public LocalDateTime getHorario() {
        return horario;
    }

    public void setHorario(LocalDateTime horario) {
        this.horario = horario;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
