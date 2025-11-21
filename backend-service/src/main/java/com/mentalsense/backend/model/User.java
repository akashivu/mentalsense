package com.mentalsense.backend.model;


import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    private String name;

    private String password;

    private Double baselineStress = 0.0;
    private Double baselineTypingSpeed = 0.0;
    private Instant createdAt = Instant.now();

    public User() {}


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Double getBaselineStress() { return baselineStress; }
    public void setBaselineStress(Double baselineStress) { this.baselineStress = baselineStress; }

    public Double getBaselineTypingSpeed() { return baselineTypingSpeed; }
    public void setBaselineTypingSpeed(Double baselineTypingSpeed) { this.baselineTypingSpeed = baselineTypingSpeed; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

