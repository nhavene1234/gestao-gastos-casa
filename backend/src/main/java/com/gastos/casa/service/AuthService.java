package com.gastos.casa.service;

import com.gastos.casa.dto.auth.AuthResponse;
import com.gastos.casa.dto.auth.LoginRequest;
import com.gastos.casa.dto.auth.RegistoRequest;
import com.gastos.casa.model.Papel;
import com.gastos.casa.model.Utilizador;
import com.gastos.casa.repository.UtilizadorRepository;
import com.gastos.casa.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UtilizadorRepository utilizadores;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UtilizadorRepository utilizadores,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.utilizadores = utilizadores;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse registar(RegistoRequest req) {
        String email = req.email().trim().toLowerCase();

        if (utilizadores.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este email já está registado");
        }

        Utilizador u = new Utilizador();
        u.setNome(req.nome().trim());
        u.setEmail(email);
        u.setSenhaHash(passwordEncoder.encode(req.senha()));
        u.setPapel(Papel.UTILIZADOR);   // registo público nunca cria admin
        utilizadores.save(u);

        return resposta(u);
    }

    public AuthResponse login(LoginRequest req) {
        String email = req.email().trim().toLowerCase();

        Utilizador u = utilizadores.findByEmail(email)
                .orElseThrow(this::credenciaisInvalidas);

        if (!u.isAtivo() || !passwordEncoder.matches(req.senha(), u.getSenhaHash())) {
            throw credenciaisInvalidas();
        }

        return resposta(u);
    }

    private ResponseStatusException credenciaisInvalidas() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou senha incorretos");
    }

    private AuthResponse resposta(Utilizador u) {
        return new AuthResponse(
                jwtService.gerarToken(u),
                "Bearer",
                u.getId(),
                u.getNome(),
                u.getEmail(),
                u.getPapel().name()
        );
    }
}