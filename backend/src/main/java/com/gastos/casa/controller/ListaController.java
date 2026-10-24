package com.gastos.casa.controller;

import com.gastos.casa.dto.lista.ListaDtos.CompradoRequest;
import com.gastos.casa.dto.lista.ListaDtos.ItemRequest;
import com.gastos.casa.dto.lista.ListaDtos.ListaRequest;
import com.gastos.casa.dto.lista.ListaDtos.ListaResponse;
import com.gastos.casa.dto.lista.ListaDtos.RegistarRequest;
import com.gastos.casa.dto.lista.ListaDtos.RegistarResponse;
import com.gastos.casa.security.UsuarioAtual;
import com.gastos.casa.service.ListaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/listas")
public class ListaController {

    private final ListaService service;

    public ListaController(ListaService service) {
        this.service = service;
    }

    @GetMapping
    public List<ListaResponse> listar(@AuthenticationPrincipal Jwt jwt) {
        return service.listar(UsuarioAtual.id(jwt));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ListaResponse criar(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ListaRequest req) {
        return service.criar(UsuarioAtual.id(jwt), req);
    }

    @PutMapping("/{id}")
    public ListaResponse atualizar(@AuthenticationPrincipal Jwt jwt,
                                   @PathVariable Long id,
                                   @Valid @RequestBody ListaRequest req) {
        return service.atualizar(UsuarioAtual.id(jwt), id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        service.remover(UsuarioAtual.id(jwt), id);
    }

    @PostMapping("/{id}/itens")
    @ResponseStatus(HttpStatus.CREATED)
    public ListaResponse adicionarItem(@AuthenticationPrincipal Jwt jwt,
                                       @PathVariable Long id,
                                       @Valid @RequestBody ItemRequest req) {
        return service.adicionarItem(UsuarioAtual.id(jwt), id, req);
    }

    @PutMapping("/{id}/itens/{itemId}")
    public ListaResponse atualizarItem(@AuthenticationPrincipal Jwt jwt,
                                       @PathVariable Long id,
                                       @PathVariable Long itemId,
                                       @Valid @RequestBody ItemRequest req) {
        return service.atualizarItem(UsuarioAtual.id(jwt), id, itemId, req);
    }

    @PatchMapping("/{id}/itens/{itemId}/comprado")
    public ListaResponse marcarComprado(@AuthenticationPrincipal Jwt jwt,
                                        @PathVariable Long id,
                                        @PathVariable Long itemId,
                                        @Valid @RequestBody CompradoRequest req) {
        return service.marcarComprado(UsuarioAtual.id(jwt), id, itemId, req);
    }

    @DeleteMapping("/{id}/itens/{itemId}")
    public ListaResponse removerItem(@AuthenticationPrincipal Jwt jwt,
                                     @PathVariable Long id,
                                     @PathVariable Long itemId) {
        return service.removerItem(UsuarioAtual.id(jwt), id, itemId);
    }

    @PostMapping("/{id}/registar")
    public RegistarResponse registar(@AuthenticationPrincipal Jwt jwt,
                                     @PathVariable Long id,
                                     @Valid @RequestBody RegistarRequest req) {
        return service.registar(UsuarioAtual.id(jwt), id, req);
    }
}