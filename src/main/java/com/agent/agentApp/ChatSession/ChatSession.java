package com.agent.agentApp.ChatSession;


import com.agent.agentApp.User.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 세션 고유 ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // 이 세션의 사용자 정보

    private LocalDateTime startedAt; // 대화 시작 시각
    private LocalDateTime endedAt;   // 대화 종료 시각
    private Integer riskScore;       // 대화 결과로 계산된 위험 점수
    private String status;           // 진행 상태 (예: 진행중, 완료)
}
