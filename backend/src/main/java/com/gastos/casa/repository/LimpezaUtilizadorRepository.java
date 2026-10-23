package com.gastos.casa.repository;

import com.gastos.casa.model.Utilizador;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

// Apagar na ordem: compras, produtos, categorias, notificações, e só depois o utilizador
public interface LimpezaUtilizadorRepository extends Repository<Utilizador, Long> {

    @Modifying
    @Query("delete from Compra c where c.utilizador.id = :uid")
    int apagarCompras(@Param("uid") Long uid);

    @Modifying
    @Query("delete from Produto p where p.utilizador.id = :uid")
    int apagarProdutos(@Param("uid") Long uid);

    @Modifying
    @Query("delete from Categoria c where c.utilizador.id = :uid")
    int apagarCategorias(@Param("uid") Long uid);

    @Modifying
    @Query("delete from Notificacao n where n.utilizador.id = :uid")
    int apagarNotificacoes(@Param("uid") Long uid);
}