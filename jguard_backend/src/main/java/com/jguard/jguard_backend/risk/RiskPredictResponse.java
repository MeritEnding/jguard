package com.jguard.jguard_backend.risk;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/** AI 위험 진단 응답 */
@Getter
@Builder
public class RiskPredictResponse {

    /** 위험 확률 (0~100) */
    private double probability;

    /** 위험 점수 (0~100, 확률과 동일 스케일) */
    private int riskScore;

    /** 위험 등급: 위험 | 주의 | 보통 | 안전 */
    private String riskLevel;

    /** 한 줄 요약 */
    private String summary;

    /** 요인별 진단 */
    private List<Factor> factors;

    /** 행동 권고 */
    private List<String> recommendations;

    /** 모델 테스트 정확도 (참고용) */
    private double modelAccuracy;

    @Getter
    @Builder
    public static class Factor {
        /** 요인명 (예: 전세가율) */
        private String name;

        /** 측정값 표시 문자열 (예: 92.0%) */
        private String value;

        /** 상태: danger | warn | safe */
        private String status;

        /** 설명 */
        private String description;
    }
}
