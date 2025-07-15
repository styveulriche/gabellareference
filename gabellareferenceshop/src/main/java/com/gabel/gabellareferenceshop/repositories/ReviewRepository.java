package com.gabel.gabellareferenceshop.repositories;

import com.gabel.gabellareferenceshop.models.Product;
import com.gabel.gabellareferenceshop.models.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProduct(Product product);
}