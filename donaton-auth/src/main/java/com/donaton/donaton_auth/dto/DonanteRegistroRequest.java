package com.donaton.donaton_auth.dto;

public class DonanteRegistroRequest {

    private String email;
    private String password;
    
    // Campos extendidos
    private String tipoPersona; // "NATURAL" o "JURIDICA"
    private String nombreCompleto;
    private String razonSocial;
    private String rut;
    private String giro;
    private String nombreContacto;
    private String telefono;
    private String region;
    private String comuna;
    private String direccion;
    private String sitioWeb;
    private Double latitud;
    private Double longitud;

    public DonanteRegistroRequest() {
        // Constructor vacío para serialización JSON
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getTipoPersona() { return tipoPersona; }
    public void setTipoPersona(String tipoPersona) { this.tipoPersona = tipoPersona; }

    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }

    public String getRazonSocial() { return razonSocial; }
    public void setRazonSocial(String razonSocial) { this.razonSocial = razonSocial; }

    public String getRut() { return rut; }
    public void setRut(String rut) { this.rut = rut; }

    public String getGiro() { return giro; }
    public void setGiro(String giro) { this.giro = giro; }

    public String getNombreContacto() { return nombreContacto; }
    public void setNombreContacto(String nombreContacto) { this.nombreContacto = nombreContacto; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getComuna() { return comuna; }
    public void setComuna(String comuna) { this.comuna = comuna; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getSitioWeb() { return sitioWeb; }
    public void setSitioWeb(String sitioWeb) { this.sitioWeb = sitioWeb; }

    public Double getLatitud() { return latitud; }
    public void setLatitud(Double latitud) { this.latitud = latitud; }

    public Double getLongitud() { return longitud; }
    public void setLongitud(Double longitud) { this.longitud = longitud; }
}
