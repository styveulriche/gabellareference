package com.gabel.gabellareferenceshop.mappers;

import com.gabel.gabellareferenceshop.dto.OrderDto;
import com.gabel.gabellareferenceshop.dto.OrderItemDto;
import com.gabel.gabellareferenceshop.models.Order;

import java.util.List;

public class OrderMapper {




    public static OrderDto toDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setReference(order.getReference());
        dto.setOrderDate(order.getOrderDate());
        dto.setTotalAmount(order.getTotalAmount());


        List<OrderItemDto> itemDtos = order.getItems().stream()
                .map(OrderItemMapper::toDto)
                .toList();
        dto.setItems(itemDtos);

        return dto;
    }

    public static Order toEntity(OrderDto dto) {
        Order order = new Order();
        order.setReference(dto.getReference());
        order.setOrderDate(dto.getOrderDate());
        order.setTotalAmount(dto.getTotalAmount());
        return order;
    }


}
