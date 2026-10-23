package com.gastos.casa.service;

import com.gastos.casa.model.Notificacao;
import com.gastos.casa.model.TipoNotificacao;
import com.gastos.casa.repository.NotificacaoRepository;
import com.gastos.casa.repository.UtilizadorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Locale;

@Service
public class AlertaService {

    private static final BigDecimal CEM = BigDecimal.valueOf(100);

    private final EstatisticaService estatisticas;
    private final NotificacaoRepository notificacoes;
    private final UtilizadorRepository utilizadores;

    public AlertaService(EstatisticaService estatisticas,
                         NotificacaoRepository notificacoes,
                         UtilizadorRepository utilizadores) {
        this.estatisticas = estatisticas;
        this.notificacoes = notificacoes;
        this.utilizadores = utilizadores;
    }

    // Chamado depois de registar ou editar uma compra.
    // Só avalia o mês atual e gera no máximo um alerta por mês.
    @Transactional
    public void verificarMesAtual(Long uid, LocalDate dataCompra) {
        YearMonth atual = YearMonth.from(EstatisticaService.hoje());
        if (!YearMonth.from(dataCompra).equals(atual)) {
            return;
        }

        String referencia = atual.toString();   // ex.: 2026-10
        if (notificacoes.existsByUtilizadorIdAndTipoAndReferencia(
                uid, TipoNotificacao.ALERTA_MEDIA, referencia)) {
            return;
        }

        BigDecimal media = estatisticas.mediaHabitual(uid, atual);
        if (media == null || media.signum() == 0) {
            return;   // histórico insuficiente
        }

        BigDecimal total = estatisticas.totalDoMes(uid, atual);
        if (total.compareTo(media) <= 0) {
            return;
        }

        BigDecimal percentagem = total.subtract(media).multiply(CEM)
                .divide(media, 1, RoundingMode.HALF_UP);
        String mes = EstatisticaService.nomeMes(atual.getMonthValue());

        Notificacao n = new Notificacao();
        n.setUtilizador(utilizadores.getReferenceById(uid));
        n.setTipo(TipoNotificacao.ALERTA_MEDIA);
        n.setTitulo("Gastos acima da média em " + mes);
        n.setMensagem("Já gastou " + formatar(total, "#,##0.00") + " MT em " + mes + ", "
                + formatar(percentagem, "0.0") + "% acima da sua média habitual de "
                + formatar(media, "#,##0.00") + " MT.");
        n.setReferencia(referencia);
        notificacoes.save(n);
    }

    // Formato português: 1.234,50
    private static String formatar(BigDecimal valor, String padrao) {
        DecimalFormatSymbols simbolos = new DecimalFormatSymbols(Locale.ROOT);
        simbolos.setDecimalSeparator(',');
        simbolos.setGroupingSeparator('.');
        return new DecimalFormat(padrao, simbolos).format(valor);
    }
}