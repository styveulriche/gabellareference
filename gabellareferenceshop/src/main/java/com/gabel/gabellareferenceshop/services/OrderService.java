package com.gabel.gabellareferenceshop.services;

import com.gabel.gabellareferenceshop.dto.OrderDto;

import java.util.List;

public interface OrderService {



    OrderDto createOrder(OrderDto orderDto);
    OrderDto getOrderByReference(String reference);
    List<OrderDto> getAllOrders();
    void deleteOrder(String reference);
}
