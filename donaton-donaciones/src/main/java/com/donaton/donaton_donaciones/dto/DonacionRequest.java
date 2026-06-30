package com.donaton.donaton_donaciones.dto;

public class DonacionRequest {
    private String nombreArticulo;
    private String recursos;
    private String origen;
    private String estado;
    private String descripcion;
    private String fotoBase64;
    private String modalidadEntrega;
    private Long centroAcopioDestinoId;
    private String direccionRetiro;
    private String disponibilidadHoraria;
    private Boolean transporteEspecial;
    private String regionRetiro;
    private String comunaRetiro;
    private Double latitudRetiro;
    private Double longitudRetiro;
    private String visibilidad;
    private Long donanteId;
    private Long conductorId;
    
    public DonacionRequest() {
        // Constructor vacío para serialización JSON
    }

    public String getNombreArticulo() { return nombreArticulo; }
    public void setNombreArticulo(String nombreArticulo) { this.nombreArticulo = nombreArticulo; }

    public String getRecursos() { return recursos; }
    public void setRecursos(String recursos) { this.recursos = recursos; }

    public String getOrigen() { return origen; }
    public void setOrigen(String origen) { this.origen = origen; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getFotoBase64() { return fotoBase64; }
    public void setFotoBase64(String fotoBase64) { this.fotoBase64 = fotoBase64; }

    public String getModalidadEntrega() { return modalidadEntrega; }
    public void setModalidadEntrega(String modalidadEntrega) { this.modalidadEntrega = modalidadEntrega; }

    public Long getCentroAcopioDestinoId() { return centroAcopioDestinoId; }
    public void setCentroAcopioDestinoId(Long centroAcopioDestinoId) { this.centroAcopioDestinoId = centroAcopioDestinoId; }

    public String getDireccionRetiro() { return direccionRetiro; }
    public void setDireccionRetiro(String direccionRetiro) { this.direccionRetiro = direccionRetiro; }

    public String getDisponibilidadHoraria() { return disponibilidadHoraria; }
    public void setDisponibilidadHoraria(String disponibilidadHoraria) { this.disponibilidadHoraria = disponibilidadHoraria; }

    public Boolean getTransporteEspecial() { return transporteEspecial; }
    public void setTransporteEspecial(Boolean transporteEspecial) { this.transporteEspecial = transporteEspecial; }

    public String getRegionRetiro() { return regionRetiro; }
    public void setRegionRetiro(String regionRetiro) { this.regionRetiro = regionRetiro; }

    public String getComunaRetiro() { return comunaRetiro; }
    public void setComunaRetiro(String comunaRetiro) { this.comunaRetiro = comunaRetiro; }

    public Long getDonanteId() { return donanteId; }
    public void setDonanteId(Long donanteId) { this.donanteId = donanteId; }

    public Double getLatitudRetiro() { return latitudRetiro; }
    public void setLatitudRetiro(Double latitudRetiro) { this.latitudRetiro = latitudRetiro; }

    public Double getLongitudRetiro() { return longitudRetiro; }
    public void setLongitudRetiro(Double longitudRetiro) { this.longitudRetiro = longitudRetiro; }

    public String getVisibilidad() { return visibilidad; }
    public void setVisibilidad(String visibilidad) { this.visibilidad = visibilidad; }

    public Long getConductorId() { return conductorId; }
    public void setConductorId(Long conductorId) { this.conductorId = conductorId; }
}
