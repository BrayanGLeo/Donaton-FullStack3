package com.donaton.donaton_auth.service;


import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @Test
    void sendPasswordRecoveryEmail_Success() {
        String toEmail = "test@example.com";
        String code = "123456";

        emailService.sendPasswordRecoveryEmail(toEmail, code);

        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, times(1)).send(messageCaptor.capture());

        SimpleMailMessage capturedMessage = messageCaptor.getValue();
        assertEquals(toEmail, capturedMessage.getTo()[0]);
        assertEquals("Recuperación de Contraseña - Donatón", capturedMessage.getSubject());
        assertTrue(capturedMessage.getText().contains(code));
    }

    @Test
    void sendPasswordRecoveryEmail_Exception() {
        String toEmail = "test@example.com";
        String code = "123456";

        doThrow(new RuntimeException("Mail server down")).when(mailSender).send(any(SimpleMailMessage.class));

        // It should catch the exception and print to syserr without throwing up
        emailService.sendPasswordRecoveryEmail(toEmail, code);

        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendCustomEmail_Success() {
        String toEmail = "test@example.com";
        String subject = "Custom Subject";
        String body = "Custom Body";

        emailService.sendCustomEmail(toEmail, subject, body);

        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, times(1)).send(messageCaptor.capture());

        SimpleMailMessage capturedMessage = messageCaptor.getValue();
        assertEquals(toEmail, capturedMessage.getTo()[0]);
        assertEquals(subject, capturedMessage.getSubject());
        assertEquals(body, capturedMessage.getText());
    }
    
    @Test
    void sendCustomEmail_Exception() {
        String toEmail = "test@example.com";
        String subject = "Custom Subject";
        String body = "Custom Body";

        doThrow(new RuntimeException("Mail server down")).when(mailSender).send(any(SimpleMailMessage.class));

        // It should catch the exception and print to syserr without throwing up
        emailService.sendCustomEmail(toEmail, subject, body);

        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }
}
