// src/main/java/com/agent_Spring/agent_spring/FraudCase/FraudStats.java
package com.agent_Spring.agent_spring.FraudCase;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fraud_stats") // 테이블 이름이 fraud_stats인지 확인
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FraudStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer year; // 연도 (예: 2023)
    private String city; // 시 (예: 충청북도)
    private String district; // 구/군 (예: 청주, 충주, 제천 등)
    private Integer count; // 전세 사기 건수
}