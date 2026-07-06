package com.jguard.jguard_backend.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class SiteUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique=true)
    private String username;

    @JsonIgnore
    private String password;

    @JsonIgnore
    @Column(unique=true)
    private String email;

    private String role;

}
