package com.gastos.casa.dto;

public record CategoriaResponse(
        Long id,
        String nome,
        String cor,
        String icone,
        boolean padrao
) {}