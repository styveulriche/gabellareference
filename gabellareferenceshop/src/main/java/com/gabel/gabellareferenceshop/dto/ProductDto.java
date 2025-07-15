package com.gabel.gabellareferenceshop.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductDto {


    private String name;
    private String description;
    private Double price;
    private String category;
    private String brand;
    private String color;
    private String size;
    private int stock;
    private String imageUrl;
}
