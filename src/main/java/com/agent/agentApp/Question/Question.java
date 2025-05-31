package com.agent.agentApp.Question;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 질문 고유 ID

    private String category; // 질문 주제 (계약 전, 임대인 확인 등)
    private String text; // 질문 텍스트
    private Integer importance; // 중요도 (1~5)
    private Double riskWeight; // 사기 판단 시 반영되는 가중치
}

