package com.gastos.casa.controller;

import com.gastos.casa.dto.admin.AtivoRequest;
import com.gastos.casa.dto.admin.AtualizarUtilizadorRequest;
import com.gastos.casa.dto.admin.CriarUtilizadorRequest;
import com.gastos.casa.dto.admin.NovaSenhaRequest;
import com.gastos.casa.dto.admin.UtilizadorAdminResponse;
import com.gastos.casa.security.UsuarioAtual;
import com.gastos.casa.service.AdminUtilizadorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/utilizadores")
public class AdminUtilizadorController {

    private final AdminUtilizadorService service;

    public AdminUtilizadorController(AdminUtilizadorService service) {
        this.service = service;
    }

    // ?pesquisa=maria (nome ou email)
    @GetMapping
    public List<UtilizadorAdminResponse> listar(@RequestParam(required = false) String pesquisa) {
        return service.listar(pesquisa);
    }

    @GetMapping("/{id}")
    public UtilizadorAdminResponse obter(@PathVariable Long id) {
        return service.obter(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UtilizadorAdminResponse criar(@Valid @RequestBody CriarUtilizadorRequest req) {
        return service.criar(req);
    }

    @PutMapping("/{id}")
    public UtilizadorAdminResponse atualizar(@AuthenticationPrincipal Jwt jwt,
                                             @PathVariable Long id,
                                             @Valid @RequestBody AtualizarUtilizadorRequest req) {
        return service.atualizar(UsuarioAtual.id(jwt), id, req);
    }

    @PatchMapping("/{id}/ativo")
    public UtilizadorAdminResponse definirAtivo(@AuthenticationPrincipal Jwt jwt,
                                                @PathVariable Long id,
                                                @Valid @RequestBody AtivoRequest req) {
        return service.definirAtivo(UsuarioAtual.id(jwt), id, req.ativo());
    }

    @PatchMapping("/{id}/senha")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void redefinirSenha(@PathVariable Long id, @Valid @RequestBody NovaSenhaRequest req) {
        service.redefinirSenha(id, req.novaSenha());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        service.remover(UsuarioAtual.id(jwt), id);
    }
}