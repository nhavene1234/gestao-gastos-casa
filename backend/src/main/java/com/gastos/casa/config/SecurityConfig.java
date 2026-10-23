package com.gastos.casa.config;

import com.gastos.casa.model.Utilizador;
import com.gastos.casa.repository.UtilizadorRepository;
import jakarta.servlet.DispatcherType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.InvalidBearerTokenException;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final UtilizadorRepository utilizadores;

    public SecurityConfig(UtilizadorRepository utilizadores) {
        this.utilizadores = utilizadores;
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                .requestMatchers("/api/auth/registo", "/api/auth/login", "/api/teste", "/error").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth -> oauth
                .jwt(jwt -> jwt.jwtAuthenticationConverter(conversor()))
            );
        return http.build();
    }

    // Em cada pedido, confirma na base de dados que a conta existe e está ativa,
    // e usa o papel ATUAL (não o que está escrito no token).
    private Converter<Jwt, AbstractAuthenticationToken> conversor() {
        return jwt -> {
            Object bruto = jwt.getClaim("id");
            if (!(bruto instanceof Number id)) {
                throw new InvalidBearerTokenException("Token sem identificação de utilizador");
            }

            Utilizador u = utilizadores.findById(id.longValue())
                    .filter(Utilizador::isAtivo)
                    .orElseThrow(() -> new InvalidBearerTokenException("Conta inexistente ou desativada"));

            List<GrantedAuthority> autoridades =
                    List.of(new SimpleGrantedAuthority("ROLE_" + u.getPapel().name()));
            return new JwtAuthenticationToken(jwt, autoridades, jwt.getSubject());
        };
    }

    // Permite que o React (Vite) chame a API
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}