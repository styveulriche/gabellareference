package com.gabel.gabellareferenceshop.repositories;

import com.gabel.gabellareferenceshop.models.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(String category);
    List<Product> findByBrand(String brand);
    List<Product> findByPriceBetween(Double min, Double max);
}