package com.gabel.gabellareferenceshop.repositories;

import com.gabel.gabellareferenceshop.models.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}