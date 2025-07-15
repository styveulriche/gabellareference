package com.gabel.gabellareferenceshop.dto;


import lombok.Data;

@Data
public class OrderItemDto {

    private Long productId;
    private int quantity;
    private Double unitPrice;

}
