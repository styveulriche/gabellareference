package com.gabel.gabellareferenceshop.repositories;

import com.gabel.gabellareferenceshop.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByFirstName(String username);


}
