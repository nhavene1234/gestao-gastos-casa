package com.gastos.casa.repository;

import com.gastos.casa.dto.estatisticas.TotalAnoMes;
import com.gastos.casa.dto.estatisticas.TotalCategoria;
import com.gastos.casa.dto.estatisticas.TotalDia;
import com.gastos.casa.dto.estatisticas.TotalMes;
import com.gastos.casa.dto.estatisticas.TotalPeriodo;
import com.gastos.casa.model.Compra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CompraRepository extends JpaRepository<Compra, Long> {

    // ---------- Passo 4 ----------

    @Query("""
            select c from Compra c
            join fetch c.produto p
            join fetch p.categoria cat
            where c.utilizador.id = :uid
              and (:de is null or c.dataCompra >= :de)
              and (:ate is null or c.dataCompra <= :ate)
              and (:categoriaId is null or cat.id = :categoriaId)
            order by c.dataCompra desc, c.id desc
            """)
    List<Compra> filtrar(@Param("uid") Long uid,
                         @Param("de") LocalDate de,
                         @Param("ate") LocalDate ate,
                         @Param("categoriaId") Long categoriaId);

    @Query("""
            select c from Compra c
            join fetch c.produto p
            join fetch p.categoria
            where c.id = :id and c.utilizador.id = :uid
            """)
    Optional<Compra> buscarDoUtilizador(@Param("id") Long id, @Param("uid") Long uid);

    boolean existsByProdutoId(Long produtoId);

    // ---------- Passo 5 ----------

    @Query("""
            select new com.gastos.casa.dto.estatisticas.TotalPeriodo(sum(c.precoTotal), count(c))
            from Compra c
            where c.utilizador.id = :uid
              and c.dataCompra between :de and :ate
            """)
    TotalPeriodo totalNoPeriodo(@Param("uid") Long uid,
                                @Param("de") LocalDate de,
                                @Param("ate") LocalDate ate);

    @Query("""
            select new com.gastos.casa.dto.estatisticas.TotalCategoria(
                       cat.id, cat.nome, cat.cor, sum(c.precoTotal), count(c))
            from Compra c
            join c.produto p
            join p.categoria cat
            where c.utilizador.id = :uid
              and c.dataCompra between :de and :ate
            group by cat.id, cat.nome, cat.cor
            order by sum(c.precoTotal) desc
            """)
    List<TotalCategoria> totaisPorCategoria(@Param("uid") Long uid,
                                            @Param("de") LocalDate de,
                                            @Param("ate") LocalDate ate);

    @Query("""
            select new com.gastos.casa.dto.estatisticas.TotalMes(
                       month(c.dataCompra), sum(c.precoTotal), count(c))
            from Compra c
            where c.utilizador.id = :uid
              and c.dataCompra between :de and :ate
            group by month(c.dataCompra)
            order by month(c.dataCompra)
            """)
    List<TotalMes> totaisPorMes(@Param("uid") Long uid,
                                @Param("de") LocalDate de,
                                @Param("ate") LocalDate ate);

    @Query("""
            select new com.gastos.casa.dto.estatisticas.TotalDia(
                       c.dataCompra, sum(c.precoTotal), count(c))
            from Compra c
            where c.utilizador.id = :uid
              and c.dataCompra between :de and :ate
            group by c.dataCompra
            order by c.dataCompra
            """)
    List<TotalDia> totaisPorDia(@Param("uid") Long uid,
                                @Param("de") LocalDate de,
                                @Param("ate") LocalDate ate);

    // ---------- Passo 6 ----------

    // Totais por ano e mês (usado para calcular a média habitual)
    @Query("""
            select new com.gastos.casa.dto.estatisticas.TotalAnoMes(
                       year(c.dataCompra), month(c.dataCompra), sum(c.precoTotal), count(c))
            from Compra c
            where c.utilizador.id = :uid
              and c.dataCompra between :de and :ate
            group by year(c.dataCompra), month(c.dataCompra)
            order by year(c.dataCompra), month(c.dataCompra)
            """)
    List<TotalAnoMes> totaisPorAnoMes(@Param("uid") Long uid,
                                      @Param("de") LocalDate de,
                                      @Param("ate") LocalDate ate);

    // Compras de produtos que já acabaram (para o tempo de consumo)
    @Query("""
            select c from Compra c
            join fetch c.produto p
            join fetch p.categoria
            where c.utilizador.id = :uid
              and c.dataFimConsumo is not null
            order by p.nome, c.dataCompra
            """)
    List<Compra> listarConcluidas(@Param("uid") Long uid);
}