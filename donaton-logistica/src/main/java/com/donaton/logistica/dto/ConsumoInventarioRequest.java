package com.donaton.logistica.dto;

public class ConsumoInventarioRequest {
    private String recurso;
    private Integer cantidad;

    public ConsumoInventarioRequest() {}

    public ConsumoInventarioRequest(String recurso, Integer cantidad) {
        this.recurso = recurso;
        this.cantidad = cantidad;
    }

    public String getRecurso() {
        return recurso;
    }

    public void setRecurso(String recurso) {
        this.recurso = recurso;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }
}
