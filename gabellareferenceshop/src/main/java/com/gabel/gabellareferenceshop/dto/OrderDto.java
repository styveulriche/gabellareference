package com.gabel.gabellareferenceshop.dto;


import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class OrderDto {

        private String reference;
        private LocalDate orderDate;
        private String status;
        private Double totalAmount;
        private Long customerId;
        private List<OrderItemDto> items;

}
