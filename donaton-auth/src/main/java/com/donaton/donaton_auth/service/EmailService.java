package com.donaton.donaton_auth.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordRecoveryEmail(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Recuperación de Contraseña - Donatón");
        message.setText("Has solicitado restablecer tu contraseña en Donatón.\n\n"
                + "Tu código de verificación es: " + code + "\n\n"
                + "Este código expirará en 15 minutos.\n"
                + "Si no solicitaste este cambio, puedes ignorar este mensaje.");
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Error enviando correo a " + toEmail + ": " + e.getMessage());
            // Para entorno de desarrollo, siempre imprimimos el código en la consola si falla el correo
            System.out.println("==================================================");
            System.out.println("CÓDIGO DE RECUPERACIÓN GENERADO: " + code);
            System.out.println("==================================================");
        }
    }

    public void sendCustomEmail(String toEmail, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Error enviando correo a " + toEmail + ": " + e.getMessage());
        }
    }
}
