package com.jguard.jguard_backend.fraudcase;

import jakarta.persistence.*;
import lombok.*;

/**
 * 시도별 전세사기 피해자 결정 현황.
 * 근거: 국토교통부 「전세사기피해자 지원 및 주거안정에 관한 특별법」 국회 보고 통계.
 */
@Entity
@Table(name = "fraud_region_stat")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FraudRegionStat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 시도명 (예: 서울, 경기, 인천) */
    @Column(unique = true)
    private String sido;

    /** 피해자 결정 인원 */
    private int victimCount;

    /** 전국 대비 비중(%) */
    private double share;

    /** 지도 표시용 위도 */
    private double lat;

    /** 지도 표시용 경도 */
    private double lng;

    /** 통계 기준일 (예: 2025-12) */
    private String basisDate;
}
