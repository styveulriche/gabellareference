package com.gabel.gabellareferenceshop.services.serviceimpls;


import com.gabel.gabellareferenceshop.dto.OrderDto;
import com.gabel.gabellareferenceshop.mappers.OrderItemMapper;
import com.gabel.gabellareferenceshop.mappers.OrderMapper;
import com.gabel.gabellareferenceshop.models.Order;
import com.gabel.gabellareferenceshop.models.OrderItem;
import com.gabel.gabellareferenceshop.models.User;
import com.gabel.gabellareferenceshop.repositories.OrderItemRepository;
import com.gabel.gabellareferenceshop.repositories.OrderRepository;
import com.gabel.gabellareferenceshop.repositories.UserRepository;
import com.gabel.gabellareferenceshop.services.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {


    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;

    @Override
    public OrderDto createOrder(OrderDto dto) {
        User user = userRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Order order = OrderMapper.toEntity(dto);

        Order saved = orderRepository.save(order);

        List<OrderItem> items = dto.getItems().stream().map(itemDto -> {
            OrderItem item = OrderItemMapper.toEntity(itemDto);
            item.setOrder(saved);
            return item;
        }).toList();

        orderItemRepository.saveAll(items);
        saved.setItems(items);

        return OrderMapper.toDto(saved);
    }

    @Override
    public OrderDto getOrderByReference(String reference) {
        Order order = orderRepository.findByReference(reference)
                .orElseThrow(() -> new RuntimeException("Commande introuvable"));
        return OrderMapper.toDto(order);
    }

    @Override
    public List<OrderDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(OrderMapper::toDto)
                .toList();
    }

    @Override
    public void deleteOrder(String reference) {
        Order order = orderRepository.findByReference(reference)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
        orderRepository.delete(order);
    }
}


