package com.gastos.casa.controller;

import com.gastos.casa.repository.CategoriaRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class TesteController {

    private final CategoriaRepository categorias;

    public TesteController(CategoriaRepository categorias) {
        this.categorias = categorias;
    }

    @GetMapping("/teste")
    public Map<String, Object> teste() {
        return Map.of(
            "estado", "ok",
            "categorias", categorias.count()
        );
    }
}