package com.gabel.gabellareferenceshop.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ReviewDto {

    private int rating;
    private String comment;
    private LocalDate reviewDate;
    private Long userId;
    private Long productId;
}
