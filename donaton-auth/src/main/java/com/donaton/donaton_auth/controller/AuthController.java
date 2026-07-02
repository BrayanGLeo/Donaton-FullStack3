package com.donaton.donaton_auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDateTime;
import java.security.SecureRandom;

import com.donaton.donaton_auth.dto.AuthResponse;
import com.donaton.donaton_auth.dto.DonanteRegistroRequest;
import com.donaton.donaton_auth.dto.ForgotPasswordRequest;
import com.donaton.donaton_auth.dto.LoginRequest;
import com.donaton.donaton_auth.dto.RegistroAdminRequest;
import com.donaton.donaton_auth.dto.ResetPasswordRequest;
import com.donaton.donaton_auth.dto.VerifyCodeRequest;
import com.donaton.donaton_auth.dto.ChangePasswordRequest;
import com.donaton.donaton_auth.dto.UpdateUserRequest;
import com.donaton.donaton_auth.entity.Usuario;
import com.donaton.donaton_auth.repository.UsuarioRepository;
import com.donaton.donaton_auth.security.JwtUtil;
import com.donaton.donaton_auth.service.EmailService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private static final String MESSAGE_KEY = "message";
    private static final String DISPONIBLE_KEY = "disponible";
    private static final String LOGISTICA_ROLE = "LOGISTICA";
    private static final String ADMIN_ROLE = "ADMIN";
    private static final String USUARIO_NO_ENCONTRADO = "Usuario no encontrado.";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );

            Usuario usuario = usuarioRepository.findByEmail(loginRequest.getEmail()).orElseThrow();
            
            // Actualizar última conexión
            usuario.setUltimaConexion(LocalDateTime.now(ZoneId.systemDefault()));
            usuarioRepository.save(usuario);

            boolean rememberMe = loginRequest.getRememberMe() != null && loginRequest.getRememberMe();
            String token = jwtUtil.generateToken(usuario.getEmail(), usuario.getRol(), usuario.getId(), rememberMe);

            String displayName = usuario.getNombreCompleto();
            if (displayName == null || displayName.trim().isEmpty()) {
                displayName = usuario.getRazonSocial();
            }

            AuthResponse response = new AuthResponse(
                token, 
                usuario.getEmail(), 
                usuario.getRol(),
                usuario.getId(),
                displayName,
                usuario.getSubRol(),
                usuario.getRegion(),
                usuario.getCentroAcopioId()
            );
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales inválidas");
        }
    }

    @PostMapping("/registro")
    public ResponseEntity<Object> registrarDonante(@RequestBody DonanteRegistroRequest request) {
        if (usuarioRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Map.of(MESSAGE_KEY, "El correo ya está registrado"));
        }
        Usuario usuario = new Usuario();
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setRol("DONANTE");
        
        // Mapear campos extendidos
        usuario.setTipoPersona(request.getTipoPersona());
        usuario.setNombreCompleto(request.getNombreCompleto());
        usuario.setRazonSocial(request.getRazonSocial());
        usuario.setRut(request.getRut());
        usuario.setGiro(request.getGiro());
        usuario.setNombreContacto(request.getNombreContacto());
        usuario.setTelefono(request.getTelefono());
        usuario.setRegion(request.getRegion());
        usuario.setComuna(request.getComuna());
        usuario.setDireccion(request.getDireccion());
        usuario.setSitioWeb(request.getSitioWeb());
        usuario.setLatitud(request.getLatitud());
        usuario.setLongitud(request.getLongitud());

        usuarioRepository.save(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(java.util.Map.of(MESSAGE_KEY, "Usuario registrado con éxito"));
    }

    @PostMapping("/admin/registro")
    public ResponseEntity<Object> registrarUsuarioAdmin(@RequestBody RegistroAdminRequest nuevoUsuario) {
        if (usuarioRepository.findByEmail(nuevoUsuario.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Map.of(MESSAGE_KEY, "El correo ya está registrado"));
        }
        if (!LOGISTICA_ROLE.equals(nuevoUsuario.getRol()) && !"COORDINADOR".equals(nuevoUsuario.getRol())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Map.of(MESSAGE_KEY, "Rol inválido. Solo LOGISTICA o COORDINADOR"));
        }
        Usuario usuario = new Usuario();
        usuario.setEmail(nuevoUsuario.getEmail());
        usuario.setPassword(passwordEncoder.encode(nuevoUsuario.getPassword()));
        usuario.setRol(nuevoUsuario.getRol());
        
        // Mapear campos extendidos
        usuario.setNombreCompleto(nuevoUsuario.getNombreCompleto());
        usuario.setRut(nuevoUsuario.getRut());
        usuario.setTelefono(nuevoUsuario.getTelefono());
        usuario.setRegion(nuevoUsuario.getRegion());
        usuario.setComuna(nuevoUsuario.getComuna());
        usuario.setDireccion(nuevoUsuario.getDireccion());
        
        // Mapear campos Logistica
        if (LOGISTICA_ROLE.equals(usuario.getRol())) {
            usuario.setSubRol(nuevoUsuario.getSubRol());
            if ("CONDUCTOR".equals(nuevoUsuario.getSubRol())) {
                usuario.setTipoVehiculo(nuevoUsuario.getTipoVehiculo());
                usuario.setMatricula(nuevoUsuario.getMatricula());
            } else if ("RECEPCIONISTA".equals(nuevoUsuario.getSubRol())) {
                usuario.setCentroAcopioId(nuevoUsuario.getCentroAcopioId());
            }
        }
        
        usuarioRepository.save(usuario);
        
        // Enviar correo de bienvenida con las credenciales
        String mensaje = "Hola " + usuario.getNombreCompleto() + ",\n\n"
                + "Tu cuenta de " + usuario.getRol() + " ha sido creada en Donaton.\n"
                + "Credenciales de acceso:\n"
                + "Correo: " + usuario.getEmail() + "\n"
                + "Contraseña provisional: " + nuevoUsuario.getPassword() + "\n\n"
                + "Te recomendamos cambiar tu contraseña al ingresar.\n\n"
                + "Saludos,\nEl equipo de Donaton";
        emailService.sendCustomEmail(usuario.getEmail(), "Bienvenido a Donaton - Tus Credenciales", mensaje);

        return ResponseEntity.status(HttpStatus.CREATED).body(java.util.Map.of(MESSAGE_KEY, "Usuario registrado con éxito"));
    }

    @GetMapping("/usuarios")
    public ResponseEntity<Page<Usuario>> listarUsuarios(
            @RequestParam(required = false) String rol,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String comuna,
            @RequestParam(required = false) String rut,
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String activo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortField,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortField).ascending() : Sort.by(sortField).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(usuarioRepository.findByFiltros(rol, region, comuna, rut, nombre, activo, pageable));
    }

    @GetMapping("/admin/usuarios/stats")
    public ResponseEntity<Map<String, Long>> obtenerStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", usuarioRepository.count());
        stats.put("activos", usuarioRepository.countActivos());
        stats.put("donantes", usuarioRepository.countByRol("DONANTE"));
        stats.put("logistica", usuarioRepository.countByRol(LOGISTICA_ROLE) + usuarioRepository.countByRol("COORDINADOR"));
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/admin/usuarios/{id}")
    public ResponseEntity<Object> actualizarUsuario(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        return usuarioRepository.findById(id).<ResponseEntity<Object>>map(usuario -> {
            if (ADMIN_ROLE.equals(usuario.getRol())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(java.util.Map.of(MESSAGE_KEY, "Los usuarios administradores no pueden ser modificados."));
            }

            // Actualizar campos permitidos (rut y password no se tocan)
            if (request.getEmail() != null && !request.getEmail().equals(usuario.getEmail())) {
                if (usuarioRepository.findByEmail(request.getEmail()).isPresent()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Map.of(MESSAGE_KEY, "El correo ya está en uso."));
                }
                usuario.setEmail(request.getEmail());
            }

            updateUsuarioFields(usuario, request);

            usuarioRepository.save(usuario);
            return ResponseEntity.ok(java.util.Map.of(MESSAGE_KEY, "Usuario actualizado exitosamente."));
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Map.of(MESSAGE_KEY, USUARIO_NO_ENCONTRADO)));
    }

    @PutMapping("/usuarios/{id}/password")
    public ResponseEntity<Object> cambiarPassword(@PathVariable Long id, @RequestBody ChangePasswordRequest request) {
        return usuarioRepository.findById(id).<ResponseEntity<Object>>map(usuario -> {
            // Verificar que la contraseña actual sea correcta
            if (!passwordEncoder.matches(request.getCurrentPassword(), usuario.getPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Map.of(MESSAGE_KEY, "La contraseña actual es incorrecta."));
            }
            
            usuario.setPassword(passwordEncoder.encode(request.getNewPassword()));
            usuarioRepository.save(usuario);
            return ResponseEntity.ok(java.util.Map.of(MESSAGE_KEY, "Contraseña actualizada exitosamente."));
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Map.of(MESSAGE_KEY, USUARIO_NO_ENCONTRADO)));
    }

    private void updateUsuarioFields(Usuario usuario, UpdateUserRequest request) {
        updateBasicFields(usuario, request);
        updateContactFields(usuario, request);
        updateLogisticaFields(usuario, request);
    }

    private void updateBasicFields(Usuario usuario, UpdateUserRequest request) {
        if (request.getRol() != null) usuario.setRol(request.getRol());
        if (request.getSubRol() != null) usuario.setSubRol(request.getSubRol());
        if (request.getTipoPersona() != null) usuario.setTipoPersona(request.getTipoPersona());
        if (request.getNombreCompleto() != null) usuario.setNombreCompleto(request.getNombreCompleto());
        if (request.getRazonSocial() != null) usuario.setRazonSocial(request.getRazonSocial());
        if (request.getGiro() != null) usuario.setGiro(request.getGiro());
    }

    private void updateContactFields(Usuario usuario, UpdateUserRequest request) {
        if (request.getNombreContacto() != null) usuario.setNombreContacto(request.getNombreContacto());
        if (request.getTelefono() != null) usuario.setTelefono(request.getTelefono());
        if (request.getRegion() != null) usuario.setRegion(request.getRegion());
        if (request.getComuna() != null) usuario.setComuna(request.getComuna());
        if (request.getDireccion() != null) usuario.setDireccion(request.getDireccion());
        if (request.getSitioWeb() != null) usuario.setSitioWeb(request.getSitioWeb());
    }

    private void updateLogisticaFields(Usuario usuario, UpdateUserRequest request) {
        if (request.getLatitud() != null) usuario.setLatitud(request.getLatitud());
        if (request.getLongitud() != null) usuario.setLongitud(request.getLongitud());
        if (request.getTipoVehiculo() != null) usuario.setTipoVehiculo(request.getTipoVehiculo());
        if (request.getMatricula() != null) usuario.setMatricula(request.getMatricula());
        if (request.getCentroAcopioId() != null) usuario.setCentroAcopioId(request.getCentroAcopioId());
    }

    @DeleteMapping("/admin/usuarios/{id}")
    public ResponseEntity<Object> eliminarUsuario(@PathVariable Long id) {
        return usuarioRepository.findById(id).<ResponseEntity<Object>>map(usuario -> {
            if (ADMIN_ROLE.equals(usuario.getRol())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(java.util.Map.of(MESSAGE_KEY, "Los usuarios administradores no pueden ser desactivados."));
            }
            usuario.setActivo(false);
            usuarioRepository.save(usuario);
            return ResponseEntity.ok(java.util.Map.of(MESSAGE_KEY, "Usuario desactivado exitosamente."));
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Map.of(MESSAGE_KEY, USUARIO_NO_ENCONTRADO)));
    }

    @PutMapping("/admin/usuarios/{id}/reactivar")
    public ResponseEntity<Object> reactivarUsuario(@PathVariable Long id) {
        return usuarioRepository.findById(id).<ResponseEntity<Object>>map(usuario -> {
            usuario.setActivo(true);
            usuarioRepository.save(usuario);
            return ResponseEntity.ok(java.util.Map.of(MESSAGE_KEY, "Usuario reactivado exitosamente."));
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Map.of(MESSAGE_KEY, USUARIO_NO_ENCONTRADO)));
    }

    @PutMapping("/admin/usuarios/bulk-status")
    public ResponseEntity<Object> actualizarEstadoMasivo(@RequestBody BulkStatusRequest request) {
        List<Usuario> usuarios = usuarioRepository.findAllById(request.getIds());
        for (Usuario u : usuarios) {
            if (!ADMIN_ROLE.equals(u.getRol())) {
                u.setActivo(request.getActivo());
            }
        }
        usuarioRepository.saveAll(usuarios);
        return ResponseEntity.ok(java.util.Map.of(MESSAGE_KEY, "Usuarios actualizados exitosamente."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Object> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return usuarioRepository.findByEmail(request.getEmail()).map(usuario -> {
            String code = String.format("%06d", SECURE_RANDOM.nextInt(999999));
            usuario.setRecoveryCode(code);
            usuario.setRecoveryCodeExpiration(LocalDateTime.now(ZoneId.systemDefault()).plusMinutes(15));
            usuarioRepository.save(usuario);
            
            emailService.sendPasswordRecoveryEmail(usuario.getEmail(), code);
            
            return ResponseEntity.ok().body((Object) java.util.Map.of(MESSAGE_KEY, "Código de recuperación enviado al correo"));
        }).orElseGet(() -> 
            // Para no revelar si el correo existe o no, siempre retornamos éxito
            ResponseEntity.ok().body((Object) java.util.Map.of(MESSAGE_KEY, "Si el correo está registrado, recibirás un código"))
        );
    }

    @PostMapping("/verify-code")
    public ResponseEntity<Object> verifyCode(@RequestBody VerifyCodeRequest request) {
        return usuarioRepository.findByEmail(request.getEmail()).<ResponseEntity<Object>>map(usuario -> {
            if (usuario.getRecoveryCode() == null || !usuario.getRecoveryCode().equals(request.getCode())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body((Object) java.util.Map.of(MESSAGE_KEY, "Código inválido"));
            }
            if (usuario.getRecoveryCodeExpiration() == null || usuario.getRecoveryCodeExpiration().isBefore(LocalDateTime.now(ZoneId.systemDefault()))) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body((Object) java.util.Map.of(MESSAGE_KEY, "El código ha expirado"));
            }
            return ResponseEntity.ok().body((Object) java.util.Map.of(MESSAGE_KEY, "Código válido"));
        }).orElse(ResponseEntity.status(HttpStatus.BAD_REQUEST).body((Object) java.util.Map.of(MESSAGE_KEY, "Usuario no encontrado")));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Object> resetPassword(@RequestBody ResetPasswordRequest request) {
        return usuarioRepository.findByEmail(request.getEmail()).<ResponseEntity<Object>>map(usuario -> {
            if (usuario.getRecoveryCode() == null || !usuario.getRecoveryCode().equals(request.getCode())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body((Object) java.util.Map.of(MESSAGE_KEY, "Código inválido"));
            }
            if (usuario.getRecoveryCodeExpiration() == null || usuario.getRecoveryCodeExpiration().isBefore(LocalDateTime.now(ZoneId.systemDefault()))) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body((Object) java.util.Map.of(MESSAGE_KEY, "El código ha expirado"));
            }
            
            usuario.setPassword(passwordEncoder.encode(request.getNewPassword()));
            usuario.setRecoveryCode(null);
            usuario.setRecoveryCodeExpiration(null);
            usuarioRepository.save(usuario);
            
            return ResponseEntity.ok().body((Object) java.util.Map.of(MESSAGE_KEY, "Contraseña actualizada exitosamente"));
        }).orElse(ResponseEntity.status(HttpStatus.BAD_REQUEST).body((Object) java.util.Map.of(MESSAGE_KEY, "Usuario no encontrado")));
    }

    @GetMapping("/verificar-email")
    public ResponseEntity<Object> verificarEmail(@RequestParam String email) {
        boolean exists = usuarioRepository.findByEmail(email).isPresent();
        if (exists) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(java.util.Map.of(DISPONIBLE_KEY, false));
        }
        return ResponseEntity.ok(java.util.Map.of(DISPONIBLE_KEY, true));
    }

    @GetMapping("/verificar-rut")
    public ResponseEntity<Object> verificarRut(@RequestParam String rut) {
        boolean exists = usuarioRepository.findByRut(rut).isPresent();
        if (exists) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(java.util.Map.of(DISPONIBLE_KEY, false));
        }
        return ResponseEntity.ok(java.util.Map.of(DISPONIBLE_KEY, true));
    }
}

class BulkStatusRequest {
    private List<Long> ids;
    private Boolean activo;

    public List<Long> getIds() {
        return ids;
    }

    public void setIds(List<Long> ids) {
        this.ids = ids;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}