package com.gastos.casa.repository;

import com.gastos.casa.model.ItemLista;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemListaRepository extends JpaRepository<ItemLista, Long> {
}