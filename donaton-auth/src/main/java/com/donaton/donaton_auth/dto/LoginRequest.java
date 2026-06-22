package com.donaton.donaton_auth.dto;

public class LoginRequest {
    private String email;
    private String password;
    private Boolean rememberMe = false;

    public LoginRequest() {
        // Constructor vacío para serialización JSON
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Boolean getRememberMe() { return rememberMe; }
    public void setRememberMe(Boolean rememberMe) { this.rememberMe = rememberMe; }
}