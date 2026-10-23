package com.gastos.casa.controller;

import com.gastos.casa.dto.CompraRequest;
import com.gastos.casa.dto.CompraResponse;
import com.gastos.casa.dto.ConsumoRequest;
import com.gastos.casa.security.UsuarioAtual;
import com.gastos.casa.service.CompraService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/compras")
public class CompraController {

    private final CompraService service;

    public CompraController(CompraService service) {
        this.service = service;
    }

    // Filtros opcionais: ?de=2026-10-01&ate=2026-10-31&categoriaId=1
    @GetMapping
    public List<CompraResponse> listar(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate de,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ate,
            @RequestParam(required = false) Long categoriaId) {
        return service.listar(UsuarioAtual.id(jwt), de, ate, categoriaId);
    }

    @GetMapping("/{id}")
    public CompraResponse obter(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return service.obter(UsuarioAtual.id(jwt), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CompraResponse criar(@AuthenticationPrincipal Jwt jwt,
                                @Valid @RequestBody CompraRequest req) {
        return service.criar(UsuarioAtual.id(jwt), req);
    }

    @PutMapping("/{id}")
    public CompraResponse atualizar(@AuthenticationPrincipal Jwt jwt,
                                    @PathVariable Long id,
                                    @Valid @RequestBody CompraRequest req) {
        return service.atualizar(UsuarioAtual.id(jwt), id, req);
    }

    // Marcar que o produto acabou (ou reabrir com null)
    @PatchMapping("/{id}/consumo")
    public CompraResponse consumo(@AuthenticationPrincipal Jwt jwt,
                                  @PathVariable Long id,
                                  @RequestBody ConsumoRequest req) {
        return service.definirConsumo(UsuarioAtual.id(jwt), id, req.dataFimConsumo());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        service.remover(UsuarioAtual.id(jwt), id);
    }
}