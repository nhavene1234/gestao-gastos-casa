package com.gastos.casa.service;

import com.gastos.casa.dto.estatisticas.ComparacaoAnualResponse;
import com.gastos.casa.dto.estatisticas.ComparacaoMes;
import com.gastos.casa.dto.estatisticas.ComparacaoMesResponse;
import com.gastos.casa.dto.estatisticas.ConsumoProduto;
import com.gastos.casa.dto.estatisticas.GastoCategoria;
import com.gastos.casa.dto.estatisticas.PeriodoResumo;
import com.gastos.casa.dto.estatisticas.ReferenciaMes;
import com.gastos.casa.dto.estatisticas.ResumoResponse;
import com.gastos.casa.dto.estatisticas.TotalAnoMes;
import com.gastos.casa.dto.estatisticas.TotalCategoria;
import com.gastos.casa.dto.estatisticas.TotalDia;
import com.gastos.casa.dto.estatisticas.TotalMes;
import com.gastos.casa.dto.estatisticas.TotalPeriodo;
import com.gastos.casa.exception.Erros;
import com.gastos.casa.model.Categoria;
import com.gastos.casa.model.Compra;
import com.gastos.casa.model.Produto;
import com.gastos.casa.repository.CompraRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class EstatisticaService {

    private static final ZoneId ZONA = ZoneId.of("Africa/Maputo");
    private static final BigDecimal ZERO = new BigDecimal("0.00");
    private static final BigDecimal CEM = BigDecimal.valueOf(100);
    private static final long MAX_DIAS = 366;
    private static final String[] MESES = {
            "janeiro", "fevereiro", "março", "abril", "maio", "junho",
            "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    };

    private final CompraRepository compras;
    private final int mesesHistorico;
    private final int mesesMinimos;

    public EstatisticaService(CompraRepository compras,
                              @Value("${app.alerta.meses-historico:12}") int mesesHistorico,
                              @Value("${app.alerta.meses-minimos:2}") int mesesMinimos) {
        this.compras = compras;
        this.mesesHistorico = mesesHistorico;
        this.mesesMinimos = mesesMinimos;
    }

    public static LocalDate hoje() {
        return LocalDate.now(ZONA);
    }

    public static String nomeMes(int mes) {
        return MESES[mes - 1];
    }

    // =====================================================================
    // Passo 5
    // =====================================================================

    @Transactional(readOnly = true)
    public ResumoResponse resumo(Long uid, LocalDate data) {
        LocalDate ref = (data != null) ? data : hoje();
        LocalDate inicioSemana = ref.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        return new ResumoResponse(
                ref,
                periodo(uid, ref, ref),
                periodo(uid, inicioSemana, inicioSemana.plusDays(6)),
                periodo(uid, ref.withDayOfMonth(1), ref.with(TemporalAdjusters.lastDayOfMonth())),
                periodo(uid, ref.with(TemporalAdjusters.firstDayOfYear()),
                             ref.with(TemporalAdjusters.lastDayOfYear()))
        );
    }

    private PeriodoResumo periodo(Long uid, LocalDate de, LocalDate ate) {
        TotalPeriodo t = compras.totalNoPeriodo(uid, de, ate);
        BigDecimal total = (t.total() == null) ? ZERO : t.total();
        long qtd = (t.compras() == null) ? 0L : t.compras();
        return new PeriodoResumo(de, ate, total, qtd);
    }

    @Transactional(readOnly = true)
    public List<GastoCategoria> porCategoria(Long uid, LocalDate de, LocalDate ate) {
        LocalDate hoje = hoje();
        LocalDate ini = (de != null) ? de : hoje.withDayOfMonth(1);
        LocalDate fim = (ate != null) ? ate : hoje.with(TemporalAdjusters.lastDayOfMonth());
        validarPeriodo(ini, fim);

        List<TotalCategoria> linhas = compras.totaisPorCategoria(uid, ini, fim);
        BigDecimal soma = linhas.stream()
                .map(TotalCategoria::total)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return linhas.stream()
                .map(l -> new GastoCategoria(
                        l.categoriaId(), l.categoriaNome(), l.cor(), l.total(), l.compras(),
                        soma.signum() == 0
                                ? BigDecimal.ZERO
                                : l.total().multiply(CEM).divide(soma, 1, RoundingMode.HALF_UP)))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TotalMes> mensal(Long uid, Integer ano) {
        int a = (ano != null) ? ano : hoje().getYear();
        if (a < 2000 || a > 2100) {
            throw Erros.pedidoInvalido("Ano inválido");
        }

        Map<Integer, TotalMes> mapa = compras
                .totaisPorMes(uid, LocalDate.of(a, 1, 1), LocalDate.of(a, 12, 31))
                .stream()
                .collect(Collectors.toMap(TotalMes::mes, Function.identity()));

        return IntStream.rangeClosed(1, 12)
                .mapToObj(m -> mapa.getOrDefault(m, new TotalMes(m, ZERO, 0L)))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TotalDia> porDia(Long uid, LocalDate de, LocalDate ate) {
        LocalDate fim = (ate != null) ? ate : hoje();
        LocalDate ini = (de != null) ? de : fim.minusDays(6);
        validarPeriodo(ini, fim);

        if (ChronoUnit.DAYS.between(ini, fim) >= MAX_DIAS) {
            throw Erros.pedidoInvalido("O intervalo máximo é de 366 dias");
        }

        Map<LocalDate, TotalDia> mapa = compras.totaisPorDia(uid, ini, fim).stream()
                .collect(Collectors.toMap(TotalDia::data, Function.identity()));

        return ini.datesUntil(fim.plusDays(1))
                .map(d -> mapa.getOrDefault(d, new TotalDia(d, ZERO, 0L)))
                .toList();
    }

    private void validarPeriodo(LocalDate de, LocalDate ate) {
        if (de.isAfter(ate)) {
            throw Erros.pedidoInvalido("A data inicial não pode ser posterior à data final");
        }
    }

    // =====================================================================
    // Passo 6: média habitual
    // =====================================================================

    // Total gasto num mês
    public BigDecimal totalDoMes(Long uid, YearMonth mes) {
        TotalPeriodo t = compras.totalNoPeriodo(uid, mes.atDay(1), mes.atEndOfMonth());
        return (t.total() == null) ? ZERO : t.total();
    }

    // Média dos totais mensais dos meses anteriores (só meses com compras).
    // Devolve null se não houver histórico suficiente.
    public BigDecimal mediaHabitual(Long uid, YearMonth mes) {
        LocalDate ate = mes.minusMonths(1).atEndOfMonth();
        LocalDate de = mes.minusMonths(mesesHistorico).atDay(1);

        List<TotalAnoMes> historico = compras.totaisPorAnoMes(uid, de, ate);
        if (historico.size() < mesesMinimos) {
            return null;
        }

        BigDecimal soma = historico.stream()
                .map(TotalAnoMes::total)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return soma.divide(BigDecimal.valueOf(historico.size()), 2, RoundingMode.HALF_UP);
    }

    // =====================================================================
    // Passo 6: comparações
    // =====================================================================

    @Transactional(readOnly = true)
    public ComparacaoMesResponse comparacaoMensal(Long uid, Integer ano, Integer mes) {
        YearMonth hoje = YearMonth.from(hoje());
        int a = (ano != null) ? ano : hoje.getYear();
        int m = (mes != null) ? mes : hoje.getMonthValue();

        if (a < 2001 || a > 2100) {
            throw Erros.pedidoInvalido("Ano inválido");
        }
        if (m < 1 || m > 12) {
            throw Erros.pedidoInvalido("Mês inválido (use de 1 a 12)");
        }
        YearMonth ym = YearMonth.of(a, m);

        TotalPeriodo tp = compras.totalNoPeriodo(uid, ym.atDay(1), ym.atEndOfMonth());
        BigDecimal total = (tp.total() == null) ? ZERO : tp.total();
        long qtd = (tp.compras() == null) ? 0L : tp.compras();

        BigDecimal media = mediaHabitual(uid, ym);
        BigDecimal diferenca = (media == null) ? null : total.subtract(media);
        BigDecimal variacaoMedia = (media == null) ? null : variacao(total, media);
        boolean acima = media != null && total.compareTo(media) > 0;

        return new ComparacaoMesResponse(
                a, m, nomeMes(m), total, qtd,
                media, diferenca, variacaoMedia, acima,
                referencia(uid, ym.minusMonths(1), total),
                referencia(uid, ym.minusYears(1), total)
        );
    }

    private ReferenciaMes referencia(Long uid, YearMonth ref, BigDecimal totalAtual) {
        BigDecimal totalRef = totalDoMes(uid, ref);
        return new ReferenciaMes(
                ref.getYear(), ref.getMonthValue(), nomeMes(ref.getMonthValue()),
                totalRef, variacao(totalAtual, totalRef));
    }

    @Transactional(readOnly = true)
    public ComparacaoAnualResponse comparacaoAnual(Long uid, Integer ano) {
        int a = (ano != null) ? ano : hoje().getYear();
        if (a < 2001 || a > 2100) {
            throw Erros.pedidoInvalido("Ano inválido");
        }

        List<TotalMes> atual = mensal(uid, a);
        List<TotalMes> anterior = mensal(uid, a - 1);

        List<ComparacaoMes> meses = IntStream.range(0, 12)
                .mapToObj(i -> new ComparacaoMes(
                        i + 1, nomeMes(i + 1), atual.get(i).total(), anterior.get(i).total()))
                .toList();

        BigDecimal totalAno = soma(atual);
        BigDecimal totalAnterior = soma(anterior);

        return new ComparacaoAnualResponse(
                a, a - 1, totalAno, totalAnterior, variacao(totalAno, totalAnterior), meses);
    }

    private BigDecimal soma(List<TotalMes> lista) {
        return lista.stream().map(TotalMes::total).reduce(ZERO, BigDecimal::add);
    }

    // Variação em % de "atual" face a "base"; null se a base for zero
    private BigDecimal variacao(BigDecimal atual, BigDecimal base) {
        if (base == null || base.signum() == 0) {
            return null;
        }
        return atual.subtract(base).multiply(CEM).divide(base, 1, RoundingMode.HALF_UP);
    }

    // =====================================================================
    // Passo 6: tempo de consumo por produto
    // =====================================================================

    @Transactional(readOnly = true)
    public List<ConsumoProduto> consumo(Long uid) {
        Map<Long, List<Compra>> porProduto = compras.listarConcluidas(uid).stream()
                .collect(Collectors.groupingBy(
                        c -> c.getProduto().getId(), LinkedHashMap::new, Collectors.toList()));

        return porProduto.values().stream().map(lista -> {
            Produto p = lista.get(0).getProduto();
            Categoria cat = p.getCategoria();

            List<Long> dias = lista.stream()
                    .map(c -> ChronoUnit.DAYS.between(c.getDataCompra(), c.getDataFimConsumo()))
                    .toList();

            BigDecimal media = BigDecimal
                    .valueOf(dias.stream().mapToLong(Long::longValue).average().orElse(0))
                    .setScale(1, RoundingMode.HALF_UP);

            LocalDate ultima = lista.stream()
                    .map(Compra::getDataCompra)
                    .max(LocalDate::compareTo)
                    .orElseThrow();

            return new ConsumoProduto(
                    p.getId(), p.getNome(), cat.getNome(), cat.getCor(),
                    lista.size(), media, Collections.min(dias), Collections.max(dias), ultima);
        }).toList();
    }
}