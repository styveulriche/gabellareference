package com.gabel.gabellareferenceshop.mappers;

import com.gabel.gabellareferenceshop.dto.OrderItemDto;
import com.gabel.gabellareferenceshop.models.OrderItem;

public class OrderItemMapper {



    public static OrderItemDto toDto(OrderItem item) {
        OrderItemDto dto = new OrderItemDto();
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        return dto;
    }

    public static OrderItem toEntity(OrderItemDto dto) {
        OrderItem item = new OrderItem();
        item.setQuantity(dto.getQuantity());
        item.setUnitPrice(dto.getUnitPrice());
        return item;
    }

}
