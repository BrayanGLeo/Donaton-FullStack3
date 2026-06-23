package com.donaton.donaton_auth.repository;

import com.donaton.donaton_auth.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByRut(String rut);

    @Query("SELECT u FROM Usuario u WHERE " +
           "(:rol IS NULL OR :rol = '' OR u.rol = :rol) AND " +
           "(:region IS NULL OR :region = '' OR u.region = :region) AND " +
           "(:comuna IS NULL OR :comuna = '' OR u.comuna = :comuna) AND " +
           "(:rut IS NULL OR :rut = '' OR u.rut LIKE %:rut%)")
    Page<Usuario> findByFiltros(
            @Param("rol") String rol, 
            @Param("region") String region, 
            @Param("comuna") String comuna, 
            @Param("rut") String rut, 
            Pageable pageable);

    long countByRol(String rol);
    
    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.activo = true OR u.activo IS NULL")
    long countActivos();
}