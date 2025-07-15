package com.gabel.gabellareferenceshop.services.serviceimpls;


import com.gabel.gabellareferenceshop.models.User;
import com.gabel.gabellareferenceshop.repositories.UserRepository;
import com.gabel.gabellareferenceshop.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {





        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder; // Pour vérifier le mot de passe hashé

        @Override
        public boolean authenticate(String email, String password) {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                // Vérifie si le mot de passe correspond
                return passwordEncoder.matches(password, user.getPassword());
            }
            return false;
        }
    }



