package com.donaton.donaton_auth.dto;

public class RegistroAdminRequest {
    private String email;
    private String password;
    private String rol;

    public RegistroAdminRequest() {
        // Constructor vacío para serialización JSON
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
}
