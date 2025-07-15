package com.gabel.gabellareferenceshop.mappers;

import com.gabel.gabellareferenceshop.dto.UserDto;
import com.gabel.gabellareferenceshop.models.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    private final PasswordEncoder passwordEncoder;

    public UserMapper(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    // Convertit une entité User vers un UserDto (masque le mot de passe)
    public UserDto toDto(User user) {
        UserDto dto = new UserDto();
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhone(user.getPhone());
        dto.setEmail(user.getEmail());
        dto.setAddress(user.getAddress());
        dto.setPassword(null); // Sécurité : on ne retourne jamais le mot de passe
        return dto;
    }

    // Convertit un UserDto en entité User, en encodant le mot de passe
    public User toEntity(UserDto dto) {
        User user = new User();
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setAddress(dto.getAddress());


        // Encodage du mot de passe uniquement s'il est fourni
        String rawPassword = dto.getPassword();
        if (rawPassword != null && !rawPassword.isBlank()) {
            user.setPassword(passwordEncoder.encode(rawPassword));
        }

        return user;
    }
}
