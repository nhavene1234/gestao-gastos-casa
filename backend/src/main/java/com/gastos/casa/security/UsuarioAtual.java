package com.gastos.casa.security;

import org.springframework.security.oauth2.jwt.Jwt;

public final class UsuarioAtual {

    private UsuarioAtual() {}

    public static Long id(Jwt jwt) {
        Number id = jwt.getClaim("id");
        return id.longValue();
    }
}