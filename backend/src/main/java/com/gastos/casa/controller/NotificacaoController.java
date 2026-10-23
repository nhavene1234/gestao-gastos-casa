package com.gastos.casa.controller;

import com.gastos.casa.dto.NotificacaoResponse;
import com.gastos.casa.security.UsuarioAtual;
import com.gastos.casa.service.NotificacaoService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notificacoes")
public class NotificacaoController {

    private final NotificacaoService service;

    public NotificacaoController(NotificacaoService service) {
        this.service = service;
    }

    // ?apenasNaoLidas=true para ver só as novas
    @GetMapping
    public List<NotificacaoResponse> listar(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "false") boolean apenasNaoLidas) {
        return service.listar(UsuarioAtual.id(jwt), apenasNaoLidas);
    }

    // Número para o "sininho"
    @GetMapping("/contagem")
    public Map<String, Long> contagem(@AuthenticationPrincipal Jwt jwt) {
        return Map.of("naoLidas", service.contarNaoLidas(UsuarioAtual.id(jwt)));
    }

    @PatchMapping("/{id}/lida")
    public NotificacaoResponse marcarLida(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return service.marcarLida(UsuarioAtual.id(jwt), id);
    }

    @PatchMapping("/marcar-todas-lidas")
    public Map<String, Integer> marcarTodasLidas(@AuthenticationPrincipal Jwt jwt) {
        return Map.of("marcadas", service.marcarTodasLidas(UsuarioAtual.id(jwt)));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        service.remover(UsuarioAtual.id(jwt), id);
    }
}