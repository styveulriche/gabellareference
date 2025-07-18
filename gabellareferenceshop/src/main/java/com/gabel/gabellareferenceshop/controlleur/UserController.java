package com.gabel.gabellareferenceshop.controlleur;


import com.gabel.gabellareferenceshop.dto.UserDto;
import com.gabel.gabellareferenceshop.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // ✅ Indique que cette classe est un contrôleur REST
@RequestMapping("/api/users") // ✅ Préfixe commun à toutes les routes de ce contrôleur
@RequiredArgsConstructor // ✅ Génère un constructeur pour les champs final
public class UserController {



        private final UserService userService; // ✅ Injection du service métier

        // ✅ Créer un utilisateur (POST /api/users)
        @PostMapping("/creerutilisateur")
        public ResponseEntity<UserDto> createUser(@RequestBody UserDto userDto) {
            UserDto createdUser = userService.createUser(userDto);
            return ResponseEntity.ok(createdUser);
        }

        // ✅ Mettre à jour un utilisateur (PUT /api/users/{id})
        @PutMapping("/modifierutilisateur/{id}")
        public ResponseEntity<UserDto> updateUser(
                @PathVariable Long id,
                @RequestBody UserDto userDto) {
            UserDto updatedUser = userService.updateUser(id, userDto);
            return ResponseEntity.ok(updatedUser);
        }

        // ✅ Supprimer un utilisateur (DELETE /api/users/{id})
        @DeleteMapping("/supprimerutilisateur/{id}")
        public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build(); // ✅ HTTP 204 si succès
        }

        // ✅ Récupérer un utilisateur par ID (GET /api/users/{id})
        @GetMapping("/recupereutilisateur/{id}")
        public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
            UserDto userDto = userService.getUserById(id);
            return ResponseEntity.ok(userDto);
        }

        // ✅ Récupérer tous les utilisateurs (GET /api/users)
        @GetMapping("/recuperetouslesutilisateur")
        public ResponseEntity<List<UserDto>> getAllUsers() {
            List<UserDto> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        }



        // ✅ Créer un utilisateur  un  utilisateur admin
    @PostMapping("/admin/register")
    public ResponseEntity<UserDto> adminregister(@RequestBody UserDto userDto) {
        UserDto createdUser = userService.createUser(userDto);
        return ResponseEntity.ok(createdUser);
    }
    }



