package com.donaton.donaton_auth.dto;

public class AuthResponse {
    private String token;
    private String email;
    private String rol;
    private Long id;
    private String nombreCompleto;
    private String subRol;
    private String region;
    private Long centroAcopioId;

    @SuppressWarnings("squid:S00107")
    public AuthResponse(String token, String email, String rol, Long id, String nombreCompleto, String subRol, String region, Long centroAcopioId) {
        this.token = token;
        this.email = email;
        this.rol = rol;
        this.id = id;
        this.nombreCompleto = nombreCompleto;
        this.subRol = subRol;
        this.region = region;
        this.centroAcopioId = centroAcopioId;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }

    public String getSubRol() { return subRol; }
    public void setSubRol(String subRol) { this.subRol = subRol; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public Long getCentroAcopioId() { return centroAcopioId; }
    public void setCentroAcopioId(Long centroAcopioId) { this.centroAcopioId = centroAcopioId; }
}