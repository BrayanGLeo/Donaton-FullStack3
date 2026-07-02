package com.donaton.donaton_auth.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.donaton.donaton_auth.dto.*;
import com.donaton.donaton_auth.entity.Usuario;
import com.donaton.donaton_auth.repository.UsuarioRepository;
import com.donaton.donaton_auth.security.JwtUtil;
import com.donaton.donaton_auth.service.EmailService;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthController authController;

    private LoginRequest loginRequest;
    private Usuario usuario;

    @BeforeEach
    void setUp() {
        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@donaton.cl");
        loginRequest.setPassword("123456");

        usuario = new Usuario();
        usuario.setId(1L);
        usuario.setEmail("test@donaton.cl");
        usuario.setRol("DONANTE");
        usuario.setNombreCompleto("Test Admin");
        usuario.setPassword("encoded_password");
    }

    @Test
    void testLogin_Success_RememberMe() {
        loginRequest.setRememberMe(true);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(usuarioRepository.findByEmail("test@donaton.cl")).thenReturn(Optional.of(usuario));
        when(jwtUtil.generateToken("test@donaton.cl", "DONANTE", 1L, true)).thenReturn("tokenFalso123");

        ResponseEntity<?> response = authController.login(loginRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof AuthResponse);
    }

    @Test
    void testLogin_Success_RememberMeFalse() {
        loginRequest.setRememberMe(false);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(usuarioRepository.findByEmail("test@donaton.cl")).thenReturn(Optional.of(usuario));
        when(jwtUtil.generateToken("test@donaton.cl", "DONANTE", 1L, false)).thenReturn("tokenFalso123");

        ResponseEntity<?> response = authController.login(loginRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof AuthResponse);
    }

    @Test
    void testLogin_Success_NoDisplayName() {
        loginRequest.setRememberMe(null);
        usuario.setNombreCompleto(null);
        usuario.setRazonSocial("Empresa");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(usuarioRepository.findByEmail("test@donaton.cl")).thenReturn(Optional.of(usuario));
        when(jwtUtil.generateToken("test@donaton.cl", "DONANTE", 1L, false)).thenReturn("tokenFalso123");

        ResponseEntity<?> response = authController.login(loginRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        AuthResponse res = (AuthResponse) response.getBody();
        assertEquals("Empresa", res.getNombreCompleto());
    }

    @Test
    void testLogin_Success_EmptyDisplayName() {
        usuario.setNombreCompleto("   ");
        usuario.setRazonSocial("Empresa");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(usuarioRepository.findByEmail("test@donaton.cl")).thenReturn(Optional.of(usuario));
        when(jwtUtil.generateToken("test@donaton.cl", "DONANTE", 1L, false)).thenReturn("tokenFalso123");

        ResponseEntity<?> response = authController.login(loginRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        AuthResponse res = (AuthResponse) response.getBody();
        assertEquals("Empresa", res.getNombreCompleto());
    }

    @Test
    void testLogin_InvalidCredentials() {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));
        ResponseEntity<?> response = authController.login(loginRequest);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void testRegistrarDonante_Success() {
        DonanteRegistroRequest request = new DonanteRegistroRequest();
        request.setEmail("nuevo@donaton.cl");
        request.setPassword("123");
        when(usuarioRepository.findByEmail("nuevo@donaton.cl")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("123")).thenReturn("enc");

        ResponseEntity<Object> response = authController.registrarDonante(request);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    @Test
    void testRegistrarDonante_EmailExists() {
        DonanteRegistroRequest request = new DonanteRegistroRequest();
        request.setEmail("test@donaton.cl");
        when(usuarioRepository.findByEmail("test@donaton.cl")).thenReturn(Optional.of(usuario));

        ResponseEntity<Object> response = authController.registrarDonante(request);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testRegistrarUsuarioAdmin_SuccessCoordinador() {
        RegistroAdminRequest request = new RegistroAdminRequest();
        request.setEmail("admin2@donaton.cl");
        request.setPassword("123");
        request.setRol("COORDINADOR");
        
        when(usuarioRepository.findByEmail("admin2@donaton.cl")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("123")).thenReturn("enc");

        ResponseEntity<Object> response = authController.registrarUsuarioAdmin(request);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    @Test
    void testRegistrarUsuarioAdmin_SuccessLogisticaRecepcionista() {
        RegistroAdminRequest request = new RegistroAdminRequest();
        request.setEmail("admin2@donaton.cl");
        request.setPassword("123");
        request.setRol("LOGISTICA");
        request.setSubRol("RECEPCIONISTA");
        request.setCentroAcopioId(5L);
        
        when(usuarioRepository.findByEmail("admin2@donaton.cl")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("123")).thenReturn("enc");

        ResponseEntity<Object> response = authController.registrarUsuarioAdmin(request);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    @Test
    void testRegistrarUsuarioAdmin_InvalidRol() {
        RegistroAdminRequest request = new RegistroAdminRequest();
        request.setEmail("admin2@donaton.cl");
        request.setRol("INVALID");
        
        ResponseEntity<Object> response = authController.registrarUsuarioAdmin(request);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
    
    @Test
    void testRegistrarUsuarioAdmin_EmailExists() {
        RegistroAdminRequest request = new RegistroAdminRequest();
        request.setEmail("test@donaton.cl");
        
        when(usuarioRepository.findByEmail("test@donaton.cl")).thenReturn(Optional.of(usuario));
        ResponseEntity<Object> response = authController.registrarUsuarioAdmin(request);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testListarUsuarios() {
        Page<Usuario> page = new PageImpl<>(List.of(usuario));
        when(usuarioRepository.findByFiltros(any(), any(), any(), any(), any(), any(), any(Pageable.class))).thenReturn(page);

        ResponseEntity<Page<Usuario>> response = authController.listarUsuarios(null, null, null, null, null, null, 0, 10, "id", "asc");
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testListarUsuarios_Desc() {
        Page<Usuario> page = new PageImpl<>(List.of(usuario));
        when(usuarioRepository.findByFiltros(any(), any(), any(), any(), any(), any(), any(Pageable.class))).thenReturn(page);

        ResponseEntity<Page<Usuario>> response = authController.listarUsuarios(null, null, null, null, null, null, 0, 10, "id", "desc");
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testObtenerStats() {
        when(usuarioRepository.count()).thenReturn(10L);
        when(usuarioRepository.countActivos()).thenReturn(8L);
        when(usuarioRepository.countByRol("DONANTE")).thenReturn(5L);
        when(usuarioRepository.countByRol("LOGISTICA")).thenReturn(2L);
        when(usuarioRepository.countByRol("COORDINADOR")).thenReturn(1L);

        ResponseEntity<Map<String, Long>> response = authController.obtenerStats();
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testActualizarUsuario_TodosLosCampos() {
        UpdateUserRequest updateReq = new UpdateUserRequest();
        updateReq.setEmail("nuevo@donaton.cl");
        updateReq.setRol("NUEVO_ROL");
        updateReq.setSubRol("NUEVO_SUBROL");
        updateReq.setTipoPersona("Natural");
        updateReq.setNombreCompleto("Nombre Modificado");
        updateReq.setRazonSocial("Razon Social");
        updateReq.setGiro("Giro");
        updateReq.setNombreContacto("Contacto");
        updateReq.setTelefono("12345678");
        updateReq.setRegion("RegionX");
        updateReq.setComuna("ComunaX");
        updateReq.setDireccion("DireccionX");
        updateReq.setSitioWeb("SitioX");
        updateReq.setLatitud(1.0);
        updateReq.setLongitud(1.0);
        updateReq.setTipoVehiculo("Furgon");
        updateReq.setMatricula("XX1234");
        updateReq.setCentroAcopioId(10L);

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.findByEmail("nuevo@donaton.cl")).thenReturn(Optional.empty());

        ResponseEntity<Object> response = authController.actualizarUsuario(1L, updateReq);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testActualizarUsuario_CamposNulos() {
        UpdateUserRequest updateReq = new UpdateUserRequest(); // Todos nulos
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        ResponseEntity<Object> response = authController.actualizarUsuario(1L, updateReq);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testRegistrarUsuarioAdmin_SuccessLogisticaConductor() {
        RegistroAdminRequest req = new RegistroAdminRequest();
        req.setEmail("admin3@donaton.cl");
        req.setPassword("123");
        req.setRol("LOGISTICA");
        req.setSubRol("CONDUCTOR");
        req.setTipoVehiculo("Moto");
        req.setMatricula("XYZ-12");

        when(usuarioRepository.findByEmail("admin3@donaton.cl")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("123")).thenReturn("enc");

        ResponseEntity<Object> response = authController.registrarUsuarioAdmin(req);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    @Test
    void testRegistrarUsuarioAdmin_SuccessLogisticaOtro() {
        RegistroAdminRequest req = new RegistroAdminRequest();
        req.setEmail("admin5@donaton.cl");
        req.setPassword("123");
        req.setRol("LOGISTICA");
        req.setSubRol("OTRO");

        when(usuarioRepository.findByEmail("admin5@donaton.cl")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("123")).thenReturn("enc");

        ResponseEntity<Object> response = authController.registrarUsuarioAdmin(req);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    @Test
    void testRegistrarUsuarioAdmin_RolDonante() {
        RegistroAdminRequest req = new RegistroAdminRequest();
        req.setEmail("admin6@donaton.cl");
        req.setPassword("123");
        req.setRol("DONANTE"); // Invalid role for admin endpoint

        ResponseEntity<Object> response = authController.registrarUsuarioAdmin(req);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testActualizarUsuario_SameEmail() {
        UpdateUserRequest updateReq = new UpdateUserRequest();
        updateReq.setEmail("test@donaton.cl"); // Mismo email
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));

        ResponseEntity<Object> response = authController.actualizarUsuario(1L, updateReq);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testActualizarEstadoMasivo_WithAdmin() {
        Usuario adminUser = new Usuario();
        adminUser.setId(2L);
        adminUser.setRol("ADMIN");
        adminUser.setActivo(true);
        
        BulkStatusRequest req = new BulkStatusRequest();
        req.setIds(List.of(1L, 2L));
        req.setActivo(false);

        when(usuarioRepository.findAllById(any())).thenReturn(List.of(usuario, adminUser));

        ResponseEntity<Object> response = authController.actualizarEstadoMasivo(req);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        // El admin no debe cambiar su estado
    }

    @Test
    void testActualizarUsuario_Success() {
        UpdateUserRequest request = new UpdateUserRequest();
        request.setEmail("nuevo@test.com");
        request.setRol("LOGISTICA");
        request.setSubRol("CONDUCTOR");
        request.setTipoPersona("NATURAL");
        request.setNombreCompleto("Nuevo Nombre");
        request.setRazonSocial("RS");
        request.setGiro("Giro");
        request.setNombreContacto("Contacto");
        request.setTelefono("12345");
        request.setRegion("Region");
        request.setComuna("Comuna");
        request.setDireccion("Dir");
        request.setSitioWeb("Web");
        request.setLatitud(1.0);
        request.setLongitud(2.0);
        request.setTipoVehiculo("VAN");
        request.setMatricula("123-AB");
        request.setCentroAcopioId(5L);
        
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.findByEmail("nuevo@test.com")).thenReturn(Optional.empty());

        ResponseEntity<Object> response = authController.actualizarUsuario(1L, request);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testActualizarUsuario_EmailInUse() {
        UpdateUserRequest request = new UpdateUserRequest();
        request.setEmail("nuevo@test.com");
        
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.findByEmail("nuevo@test.com")).thenReturn(Optional.of(new Usuario()));

        ResponseEntity<Object> response = authController.actualizarUsuario(1L, request);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testActualizarUsuario_AdminForbidden() {
        usuario.setRol("ADMIN");
        UpdateUserRequest request = new UpdateUserRequest();
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        ResponseEntity<Object> response = authController.actualizarUsuario(1L, request);
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void testActualizarUsuario_NotFound() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.empty());
        ResponseEntity<Object> response = authController.actualizarUsuario(1L, new UpdateUserRequest());
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void testCambiarPassword_Success() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("old_pass");
        request.setNewPassword("new_pass");
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("old_pass", "encoded_password")).thenReturn(true);
        when(passwordEncoder.encode("new_pass")).thenReturn("new_encoded");

        ResponseEntity<Object> response = authController.cambiarPassword(1L, request);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testVerifyCode_NullRecoveryCode() {
        usuario.setRecoveryCode(null);
        when(usuarioRepository.findByEmail("test@donaton.cl")).thenReturn(Optional.of(usuario));
        
        VerifyCodeRequest request = new VerifyCodeRequest();
        request.setEmail("test@donaton.cl");
        request.setCode("123456");
        
        ResponseEntity<Object> response = authController.verifyCode(request);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testVerifyCode_NullRecoveryCodeExpiration() {
        usuario.setRecoveryCode("123456");
        usuario.setRecoveryCodeExpiration(null);
        when(usuarioRepository.findByEmail("test@donaton.cl")).thenReturn(Optional.of(usuario));
        
        VerifyCodeRequest request = new VerifyCodeRequest();
        request.setEmail("test@donaton.cl");
        request.setCode("123456");
        
        ResponseEntity<Object> response = authController.verifyCode(request);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testResetPassword_NullRecoveryCode() {
        usuario.setRecoveryCode(null);
        when(usuarioRepository.findByEmail("test@donaton.cl")).thenReturn(Optional.of(usuario));
        
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setEmail("test@donaton.cl");
        request.setCode("123456");
        request.setNewPassword("new_pass");
        
        ResponseEntity<Object> response = authController.resetPassword(request);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testResetPassword_NullRecoveryCodeExpiration() {
        usuario.setRecoveryCode("123456");
        usuario.setRecoveryCodeExpiration(null);
        when(usuarioRepository.findByEmail("test@donaton.cl")).thenReturn(Optional.of(usuario));
        
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setEmail("test@donaton.cl");
        request.setCode("123456");
        request.setNewPassword("new_pass");
        
        ResponseEntity<Object> response = authController.resetPassword(request);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testCambiarPassword_WrongPass() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("old_pass");
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("old_pass", "encoded_password")).thenReturn(false);

        ResponseEntity<Object> response = authController.cambiarPassword(1L, request);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testCambiarPassword_NotFound() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.empty());
        ResponseEntity<Object> response = authController.cambiarPassword(1L, new ChangePasswordRequest());
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void testEliminarUsuario_Success() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        ResponseEntity<Object> response = authController.eliminarUsuario(1L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testEliminarUsuario_AdminForbidden() {
        usuario.setRol("ADMIN");
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        ResponseEntity<Object> response = authController.eliminarUsuario(1L);
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void testEliminarUsuario_NotFound() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.empty());
        ResponseEntity<Object> response = authController.eliminarUsuario(1L);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void testReactivarUsuario_Success() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        ResponseEntity<Object> response = authController.reactivarUsuario(1L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testReactivarUsuario_NotFound() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.empty());
        ResponseEntity<Object> response = authController.reactivarUsuario(1L);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void testActualizarEstadoMasivo_Success() {
        BulkStatusRequest request = new BulkStatusRequest();
        request.setIds(List.of(1L, 2L));
        request.setActivo(false);
        Usuario admin = new Usuario(); admin.setRol("ADMIN");
        when(usuarioRepository.findAllById(any())).thenReturn(List.of(usuario, admin));
        ResponseEntity<Object> response = authController.actualizarEstadoMasivo(request);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testForgotPassword_Success() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("test@donaton.cl");
        when(usuarioRepository.findByEmail("test@donaton.cl")).thenReturn(Optional.of(usuario));
        ResponseEntity<Object> response = authController.forgotPassword(request);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testForgotPassword_NotFound() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("none@donaton.cl");
        when(usuarioRepository.findByEmail("none@donaton.cl")).thenReturn(Optional.empty());
        ResponseEntity<Object> response = authController.forgotPassword(request);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testVerifyCode_Success() {
        VerifyCodeRequest request = new VerifyCodeRequest();
        request.setEmail("test@donaton.cl");
        request.setCode("123456");
        usuario.setRecoveryCode("123456");
        usuario.setRecoveryCodeExpiration(LocalDateTime.now().plusHours(1));
        when(usuarioRepository.findByEmail("test@donaton.cl")).thenReturn(Optional.of(usuario));
        ResponseEntity<Object> response = authController.verifyCode(request);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testVerifyCode_InvalidCode() {
        VerifyCodeRequest request = new VerifyCodeRequest();
        request.setEmail("test@donaton.cl");
        request.setCode("111");
        usuario.setRecoveryCode("222");
        when(usuarioRepository.findByEmail("test@donaton.cl")).thenReturn(Optional.of(usuario));
        ResponseEntity<Object> response = authController.verifyCode(request);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testVerifyCode_ExpiredCode() {
        VerifyCodeRequest request = new VerifyCodeRequest();
        request.setEmail("test@donaton.cl");
        request.setCode("111");
        usuario.setRecoveryCode("111");
        usuario.setRecoveryCodeExpiration(LocalDateTime.now().minusHours(1));
        when(usuarioRepository.findByEmail("test@donaton.cl")).thenReturn(Optional.of(usuario));
        ResponseEntity<Object> response = authController.verifyCode(request);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testVerifyCode_NotFound() {
        VerifyCodeRequest request = new VerifyCodeRequest();
        request.setEmail("test@donaton.cl");
        when(usuarioRepository.findByEmail(any())).thenReturn(Optional.empty());
        ResponseEntity<Object> response = authController.verifyCode(request);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testResetPassword_Success() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setEmail("test@donaton.cl");
        request.setCode("123456");
        request.setNewPassword("newpass");
        usuario.setRecoveryCode("123456");
        usuario.setRecoveryCodeExpiration(LocalDateTime.now().plusHours(1));
        when(usuarioRepository.findByEmail("test@donaton.cl")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.encode("newpass")).thenReturn("encoded");
        ResponseEntity<Object> response = authController.resetPassword(request);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testResetPassword_InvalidCode() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setEmail("test@donaton.cl");
        request.setCode("111");
        usuario.setRecoveryCode("222");
        when(usuarioRepository.findByEmail("test@donaton.cl")).thenReturn(Optional.of(usuario));
        ResponseEntity<Object> response = authController.resetPassword(request);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testResetPassword_ExpiredCode() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setEmail("test@donaton.cl");
        request.setCode("111");
        usuario.setRecoveryCode("111");
        usuario.setRecoveryCodeExpiration(LocalDateTime.now().minusHours(1));
        when(usuarioRepository.findByEmail("test@donaton.cl")).thenReturn(Optional.of(usuario));
        ResponseEntity<Object> response = authController.resetPassword(request);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testResetPassword_NotFound() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setEmail("test@donaton.cl");
        when(usuarioRepository.findByEmail(any())).thenReturn(Optional.empty());
        ResponseEntity<Object> response = authController.resetPassword(request);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testVerificarEmail_Success() {
        when(usuarioRepository.findByEmail("test@donaton.cl")).thenReturn(Optional.of(usuario));
        ResponseEntity<Object> response = authController.verificarEmail("test@donaton.cl");
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    }

    @Test
    void testVerificarEmail_Available() {
        when(usuarioRepository.findByEmail("test@donaton.cl")).thenReturn(Optional.empty());
        ResponseEntity<Object> response = authController.verificarEmail("test@donaton.cl");
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testVerificarRut_Success() {
        when(usuarioRepository.findByRut("12345678-9")).thenReturn(Optional.of(usuario));
        ResponseEntity<Object> response = authController.verificarRut("12345678-9");
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    }

    @Test
    void testVerificarRut_Available() {
        when(usuarioRepository.findByRut("12345678-9")).thenReturn(Optional.empty());
        ResponseEntity<Object> response = authController.verificarRut("12345678-9");
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
}