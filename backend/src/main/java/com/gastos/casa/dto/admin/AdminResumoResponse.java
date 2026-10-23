package com.gastos.casa.dto.admin;

public record AdminResumoResponse(
        long utilizadores,
        long ativos,
        long inativos,
        long administradores,
        long produtos,
        long compras,
        long categoriasPadrao
) {}