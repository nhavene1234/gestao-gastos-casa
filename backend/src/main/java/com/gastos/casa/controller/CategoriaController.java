package com.gastos.casa.controller;

import com.gastos.casa.dto.CategoriaRequest;
import com.gastos.casa.dto.CategoriaResponse;
import com.gastos.casa.security.UsuarioAtual;
import com.gastos.casa.service.CategoriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService service;

    public CategoriaController(CategoriaService service) {
        this.service = service;
    }

    @GetMapping
    public List<CategoriaResponse> listar(@AuthenticationPrincipal Jwt jwt) {
        return service.listar(UsuarioAtual.id(jwt));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoriaResponse criar(@AuthenticationPrincipal Jwt jwt,
                                   @Valid @RequestBody CategoriaRequest req) {
        return service.criar(UsuarioAtual.id(jwt), req);
    }

    @PutMapping("/{id}")
    public CategoriaResponse atualizar(@AuthenticationPrincipal Jwt jwt,
                                       @PathVariable Long id,
                                       @Valid @RequestBody CategoriaRequest req) {
        return service.atualizar(UsuarioAtual.id(jwt), id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        service.remover(UsuarioAtual.id(jwt), id);
    }
}