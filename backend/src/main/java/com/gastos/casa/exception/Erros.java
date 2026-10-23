package com.gastos.casa.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class Erros {

    private Erros() {}

    public static ResponseStatusException naoEncontrado(String mensagem) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, mensagem);
    }

    public static ResponseStatusException conflito(String mensagem) {
        return new ResponseStatusException(HttpStatus.CONFLICT, mensagem);
    }

    public static ResponseStatusException pedidoInvalido(String mensagem) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem);
    }

    public static ResponseStatusException proibido(String mensagem) {
        return new ResponseStatusException(HttpStatus.FORBIDDEN, mensagem);
    }
}