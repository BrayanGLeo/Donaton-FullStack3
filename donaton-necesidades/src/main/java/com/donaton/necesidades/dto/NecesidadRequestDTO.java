package com.donaton.necesidades.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class NecesidadRequestDTO {

    @NotBlank(message = "Los recursos no pueden estar vacíos")
    private String recursos;

    @NotNull(message = "La latitud es obligatoria")
    @Min(value = -56, message = "La latitud no puede ser menor a -56.0")
    @Max(value = -17, message = "La latitud no puede ser mayor a -17.0")
    private Double latitud;

    @NotNull(message = "La longitud es obligatoria")
    @Min(value = -76, message = "La longitud no puede ser menor a -76.0")
    @Max(value = -66, message = "La longitud no puede ser mayor a -66.0")
    private Double longitud;

    private String region;

    private String comuna;

    private String tipoEmergencia;

    private Long coordinadorId;

    public NecesidadRequestDTO() {
        // Constructor vacío para serialización JSON
    }

    public NecesidadRequestDTO(String recursos, Double latitud, Double longitud, String region, String comuna, String tipoEmergencia) {
        this.recursos = recursos;
        this.latitud = latitud;
        this.longitud = longitud;
        this.region = region;
        this.comuna = comuna;
        this.tipoEmergencia = tipoEmergencia;
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

    public Long getCoordinadorId() {
        return coordinadorId;
    }

    public void setCoordinadorId(Long coordinadorId) {
        this.coordinadorId = coordinadorId;
    }
}
