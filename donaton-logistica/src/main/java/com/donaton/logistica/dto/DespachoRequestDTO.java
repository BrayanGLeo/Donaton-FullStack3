package com.donaton.logistica.dto;

import java.time.LocalDateTime;

public class DespachoRequestDTO {

    private Long inventarioId;
    private Integer cantidad;
    private String vehiculo;
    private LocalDateTime horario;

    public DespachoRequestDTO() {
        // Constructor vacío para serialización JSON
    }

    public DespachoRequestDTO(Long inventarioId, Integer cantidad, String vehiculo, LocalDateTime horario) {
        this.inventarioId = inventarioId;
        this.cantidad = cantidad;
        this.vehiculo = vehiculo;
        this.horario = horario;
    }

    public Long getInventarioId() {
        return inventarioId;
    }

    public void setInventarioId(Long inventarioId) {
        this.inventarioId = inventarioId;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
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
}
