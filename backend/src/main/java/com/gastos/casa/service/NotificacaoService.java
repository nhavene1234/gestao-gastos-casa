package com.gastos.casa.service;

import com.gastos.casa.dto.NotificacaoResponse;
import com.gastos.casa.exception.Erros;
import com.gastos.casa.model.Notificacao;
import com.gastos.casa.repository.NotificacaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificacaoService {

    private final NotificacaoRepository notificacoes;

    public NotificacaoService(NotificacaoRepository notificacoes) {
        this.notificacoes = notificacoes;
    }

    @Transactional(readOnly = true)
    public List<NotificacaoResponse> listar(Long uid, boolean apenasNaoLidas) {
        List<Notificacao> lista = apenasNaoLidas
                ? notificacoes.findTop50ByUtilizadorIdAndLidaFalseOrderByIdDesc(uid)
                : notificacoes.findTop50ByUtilizadorIdOrderByIdDesc(uid);
        return lista.stream().map(this::paraResposta).toList();
    }

    @Transactional(readOnly = true)
    public long contarNaoLidas(Long uid) {
        return notificacoes.countByUtilizadorIdAndLidaFalse(uid);
    }

    @Transactional
    public NotificacaoResponse marcarLida(Long uid, Long id) {
        Notificacao n = buscar(uid, id);
        n.setLida(true);
        return paraResposta(n);
    }

    @Transactional
    public int marcarTodasLidas(Long uid) {
        return notificacoes.marcarTodasComoLidas(uid);
    }

    @Transactional
    public void remover(Long uid, Long id) {
        notificacoes.delete(buscar(uid, id));
    }

    private Notificacao buscar(Long uid, Long id) {
        return notificacoes.findByIdAndUtilizadorId(id, uid)
                .orElseThrow(() -> Erros.naoEncontrado("Notificação não encontrada"));
    }

    private NotificacaoResponse paraResposta(Notificacao n) {
        return new NotificacaoResponse(
                n.getId(), n.getTipo().name(), n.getTitulo(), n.getMensagem(),
                n.isLida(), n.getCriadoEm(), n.getReferencia());
    }
}