package com.gastos.casa.controller;

import com.gastos.casa.dto.estatisticas.ComparacaoAnualResponse;
import com.gastos.casa.dto.estatisticas.ComparacaoMesResponse;
import com.gastos.casa.dto.estatisticas.ConsumoProduto;
import com.gastos.casa.dto.estatisticas.GastoCategoria;
import com.gastos.casa.dto.estatisticas.ResumoResponse;
import com.gastos.casa.dto.estatisticas.TotalDia;
import com.gastos.casa.dto.estatisticas.TotalMes;
import com.gastos.casa.security.UsuarioAtual;
import com.gastos.casa.service.EstatisticaService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/estatisticas")
public class EstatisticaController {

    private final EstatisticaService service;

    public EstatisticaController(EstatisticaService service) {
        this.service = service;
    }

    // ---------- Passo 5 ----------

    @GetMapping("/resumo")
    public ResumoResponse resumo(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return service.resumo(UsuarioAtual.id(jwt), data);
    }

    @GetMapping("/por-categoria")
    public List<GastoCategoria> porCategoria(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate de,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ate) {
        return service.porCategoria(UsuarioAtual.id(jwt), de, ate);
    }

    @GetMapping("/mensal")
    public List<TotalMes> mensal(@AuthenticationPrincipal Jwt jwt,
                                 @RequestParam(required = false) Integer ano) {
        return service.mensal(UsuarioAtual.id(jwt), ano);
    }

    @GetMapping("/por-dia")
    public List<TotalDia> porDia(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate de,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ate) {
        return service.porDia(UsuarioAtual.id(jwt), de, ate);
    }

    // ---------- Passo 6 ----------

    // Mês vs mês anterior, vs mesmo mês do ano passado e vs média habitual
    @GetMapping("/comparacao/mensal")
    public ComparacaoMesResponse comparacaoMensal(@AuthenticationPrincipal Jwt jwt,
                                                  @RequestParam(required = false) Integer ano,
                                                  @RequestParam(required = false) Integer mes) {
        return service.comparacaoMensal(UsuarioAtual.id(jwt), ano, mes);
    }

    // Ano vs ano anterior, mês a mês
    @GetMapping("/comparacao/anual")
    public ComparacaoAnualResponse comparacaoAnual(@AuthenticationPrincipal Jwt jwt,
                                                   @RequestParam(required = false) Integer ano) {
        return service.comparacaoAnual(UsuarioAtual.id(jwt), ano);
    }

    // Quantos dias dura cada produto
    @GetMapping("/consumo")
    public List<ConsumoProduto> consumo(@AuthenticationPrincipal Jwt jwt) {
        return service.consumo(UsuarioAtual.id(jwt));
    }
}