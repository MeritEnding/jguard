package com.agent.agentApp.RiskAssessment;

import com.agent.agentApp.ChatSession.ChatSession;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "risk_assessments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskAssessment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 평가 고유 ID

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private ChatSession session; // 어떤 대화 세션에 대한 평가인지

    private Integer riskScore; // 계산된 위험 점수 (0~100)
    private String riskLevel;  // 위험 등급 (낮음, 중간, 높음)
    private String summary;    // 요약 판단 사유
}

