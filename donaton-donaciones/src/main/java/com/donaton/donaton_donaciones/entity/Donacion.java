package com.donaton.donaton_donaciones.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "donaciones")
public class Donacion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String recurso;
    private Integer cantidad;
    private String origen;
    private String estado;
    private String trackingId;
    private LocalDateTime fechaRegistro;
    private String acopioRecepcion;

    private String categoria;
    
    @Column(length = 1000)
    private String descripcion;
    
    private String estadoArticulo;
    private String fechaVencimiento;
    private String unidadMedida;
    private Double pesoAproximado;
    
    @Column(columnDefinition = "LONGTEXT")
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

    public Donacion() {
        // Constructor vacío requerido por JPA
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRecurso() { return recurso; }
    public void setRecurso(String recurso) { this.recurso = recurso; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public String getOrigen() { return origen; }
    public void setOrigen(String origen) { this.origen = origen; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getTrackingId() { return trackingId; }
    public void setTrackingId(String trackingId) { this.trackingId = trackingId; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public String getAcopioRecepcion() { return acopioRecepcion; }
    public void setAcopioRecepcion(String acopioRecepcion) { this.acopioRecepcion = acopioRecepcion; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getEstadoArticulo() { return estadoArticulo; }
    public void setEstadoArticulo(String estadoArticulo) { this.estadoArticulo = estadoArticulo; }

    public String getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(String fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }

    public String getUnidadMedida() { return unidadMedida; }
    public void setUnidadMedida(String unidadMedida) { this.unidadMedida = unidadMedida; }

    public Double getPesoAproximado() { return pesoAproximado; }
    public void setPesoAproximado(Double pesoAproximado) { this.pesoAproximado = pesoAproximado; }

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
}