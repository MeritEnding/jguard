package com.jguard.jguard_backend.risk;

import jakarta.persistence.*;
import lombok.*;

/**
 * 시도별 전세 시장 지표.
 * 근거: 한국부동산원 임대차시장 사이렌 전세가율 통계, HUG 전세보증금 반환보증 사고 통계.
 */
@Entity
@Table(name = "region_market_stat")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegionMarketStat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 시도명 (예: 서울, 경기, 인천) */
    @Column(unique = true)
    private String sido;

    /** 아파트 전세가율(%) */
    private double jeonseRatioApt;

    /** 연립·다세대 전세가율(%) */
    private double jeonseRatioVilla;

    /** HUG 전세보증 사고율(%) */
    private double hugAccidentRate;

    /** 통계 기준일 (예: 2025-12) */
    private String basisDate;
}
