package com.gabel.gabellareferenceshop.controlleur;


import com.gabel.gabellareferenceshop.dto.LoginDto;
import com.gabel.gabellareferenceshop.services.AuthService;
import com.gabel.gabellareferenceshop.util.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {



        private  final AuthService authService;
        private final JwtUtils jwtUtils;

        /**
         * Endpoint pour authentifier un utilisateur
         * @param loginDto (email et mot de passe)
         * @return un message de succès ou d'erreur
         */
        @PostMapping("/login")
        public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
            try {
                boolean isAuthenticated = authService.authenticate(loginDto.getEmail(), loginDto.getPassword());

                if (isAuthenticated) {
                    String token = jwtUtils.generateToken(loginDto.getEmail());
                    return ResponseEntity.ok().body("Connexion réussie. Token : Bearer " + token);
                } else {
                    return ResponseEntity.status(401).body("Échec de connexion : identifiants invalides.");
                }
            } catch (Exception e) {
                // Log l’erreur si tu as un logger
                // logger.error("Erreur lors de la tentative de connexion", e);
                return ResponseEntity.status(500).body("Erreur serveur lors de la connexion : " + e.getMessage());
            }
        }

}


