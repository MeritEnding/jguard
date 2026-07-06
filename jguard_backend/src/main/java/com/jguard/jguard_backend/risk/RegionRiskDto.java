package com.jguard.jguard_backend.risk;

import lombok.Builder;
import lombok.Getter;

/** 시도별 위험지수 응답 */
@Getter
@Builder
public class RegionRiskDto {

    private String sido;

    /** 종합 위험지수 (0~100) */
    private int riskScore;

    /** 위험 등급: 위험 | 주의 | 보통 | 안전 */
    private String riskLevel;

    private double jeonseRatioApt;
    private double jeonseRatioVilla;
    private double hugAccidentRate;

    private int victimCount;
    private double share;

    private double lat;
    private double lng;

    private String basisDate;
}
