package com.gastos.casa.repository;

import com.gastos.casa.model.Notificacao;
import com.gastos.casa.model.TipoNotificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

    List<Notificacao> findTop50ByUtilizadorIdOrderByIdDesc(Long utilizadorId);

    List<Notificacao> findTop50ByUtilizadorIdAndLidaFalseOrderByIdDesc(Long utilizadorId);

    long countByUtilizadorIdAndLidaFalse(Long utilizadorId);

    Optional<Notificacao> findByIdAndUtilizadorId(Long id, Long utilizadorId);

    boolean existsByUtilizadorIdAndTipoAndReferencia(
            Long utilizadorId, TipoNotificacao tipo, String referencia);

    @Modifying(clearAutomatically = true)
    @Query("update Notificacao n set n.lida = true where n.utilizador.id = :uid and n.lida = false")
    int marcarTodasComoLidas(@Param("uid") Long uid);
}