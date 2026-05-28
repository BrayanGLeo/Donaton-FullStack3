package com.donaton.donaton_donaciones.dto;

public class DonacionRequest {
    private String recurso;
    private Integer cantidad;
    private String origen;
    private String estado;
    
    public DonacionRequest() {
        // Constructor vacío para serialización JSON
    }

    public String getRecurso() { return recurso; }
    public void setRecurso(String recurso) { this.recurso = recurso; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public String getOrigen() { return origen; }
    public void setOrigen(String origen) { this.origen = origen; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
