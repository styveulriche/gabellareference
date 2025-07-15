package com.gabel.gabellareferenceshop.repositories;

import com.gabel.gabellareferenceshop.models.Order;
import com.gabel.gabellareferenceshop.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomer(User customer);
    Optional<Order> findByReference(String reference);
}