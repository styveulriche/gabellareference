package com.gabel.gabellareferenceshop.models;


import com.gabel.gabellareferenceshop.exception.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Setter
public class User {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;
    private String address;
    private String phone;


    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean enabled = true;



}
