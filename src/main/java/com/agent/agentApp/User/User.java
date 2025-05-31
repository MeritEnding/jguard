package com.agent.agentApp.User;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 사용자 고유 ID

    private String name; // 사용자 이름

    private String phone; // 사용자 전화번호 (선택)

    private LocalDateTime createdAt; // 계정 생성 시각

    private LocalDateTime updatedAt; // 마지막 접속 시각

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}