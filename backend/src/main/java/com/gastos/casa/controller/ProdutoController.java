package com.gastos.casa.controller;

import com.gastos.casa.dto.ProdutoRequest;
import com.gastos.casa.dto.ProdutoResponse;
import com.gastos.casa.security.UsuarioAtual;
import com.gastos.casa.service.ProdutoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoService service;

    public ProdutoController(ProdutoService service) {
        this.service = service;
    }

    @GetMapping
    public List<ProdutoResponse> listar(@AuthenticationPrincipal Jwt jwt) {
        return service.listar(UsuarioAtual.id(jwt));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProdutoResponse criar(@AuthenticationPrincipal Jwt jwt,
                                 @Valid @RequestBody ProdutoRequest req) {
        return service.criar(UsuarioAtual.id(jwt), req);
    }

    @PutMapping("/{id}")
    public ProdutoResponse atualizar(@AuthenticationPrincipal Jwt jwt,
                                     @PathVariable Long id,
                                     @Valid @RequestBody ProdutoRequest req) {
        return service.atualizar(UsuarioAtual.id(jwt), id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        service.remover(UsuarioAtual.id(jwt), id);
    }
}