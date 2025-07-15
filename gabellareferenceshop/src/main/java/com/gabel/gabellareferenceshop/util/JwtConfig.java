package com.gabel.gabellareferenceshop.util;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

@Configuration
public class JwtConfig {
    @Bean
    public SecretKey secretKey() throws Exception {
        // Utilisez un générateur de clé pour l'algorithme HmacSHA256
        KeyGenerator keyGenerator = KeyGenerator.getInstance("HmacSHA256");
        keyGenerator.init(512); // Taille de la clé (256 bits)
        return keyGenerator.generateKey(); // Retourne la clé secrète
    }


}
