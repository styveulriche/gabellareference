package com.gabel.gabellareferenceshop.mappers;

import com.gabel.gabellareferenceshop.dto.ProductDto;
import com.gabel.gabellareferenceshop.models.Product;
import org.springframework.stereotype.Component;


@Component
public class ProductMapper {




    // 🔄 Convertit DTO → Entité
    public Product toEntity(ProductDto dto) {
        if (dto == null) return null;

        return Product.builder()

                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .stock(dto.getStock())
                .category(dto.getCategory())
                .imageUrl(dto.getImageUrl())
                .brand(dto.getBrand())
                .color(dto.getColor())
                .size(dto.getSize())
                .build();
    }

    // 🔄 Convertit Entité → DTO
    public ProductDto toDto(Product entity) {
        if (entity == null) return null;

        return ProductDto.builder()
                .name(entity.getName())
                .description(entity.getDescription())
                .price(entity.getPrice())
                .imageUrl(entity.getImageUrl())
                .brand(entity.getBrand())
                .color(entity.getColor())
                .size(entity.getSize())
                .stock(entity.getStock())
                .category(entity.getCategory())
                .build();
    }

}
