package com.gastos.casa.controller;

import com.gastos.casa.dto.admin.AdminResumoResponse;
import com.gastos.casa.service.AdminUtilizadorService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminUtilizadorService service;

    public AdminController(AdminUtilizadorService service) {
        this.service = service;
    }

    @GetMapping("/teste")
    public Map<String, String> teste() {
        return Map.of("mensagem", "Bem-vindo, admin");
    }

    // Visão geral do sistema
    @GetMapping("/resumo")
    public AdminResumoResponse resumo() {
        return service.resumo();
    }
}