package com.gastos.casa.config;

import com.gastos.casa.model.Papel;
import com.gastos.casa.model.Utilizador;
import com.gastos.casa.repository.UtilizadorRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UtilizadorRepository utilizadores;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.nome}")
    private String adminNome;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.senha}")
    private String adminSenha;

    public DataInitializer(UtilizadorRepository utilizadores, PasswordEncoder passwordEncoder) {
        this.utilizadores = utilizadores;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String email = adminEmail.trim().toLowerCase();
        if (utilizadores.existsByEmail(email)) {
            return;
        }
        Utilizador admin = new Utilizador();
        admin.setNome(adminNome);
        admin.setEmail(email);
        admin.setSenhaHash(passwordEncoder.encode(adminSenha));
        admin.setPapel(Papel.ADMIN);
        utilizadores.save(admin);
        System.out.println(">>> Admin inicial criado: " + email);
    }
}