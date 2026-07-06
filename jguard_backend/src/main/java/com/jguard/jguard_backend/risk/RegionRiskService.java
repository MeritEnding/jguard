package com.jguard.jguard_backend.risk;

import com.jguard.jguard_backend.fraudcase.FraudRegionStat;
import com.jguard.jguard_backend.fraudcase.FraudRegionStatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 시도별 종합 위험지수 산출.
 * 전세가율(연립·아파트), 피해자 비중, HUG 보증사고율을 가중 합산해 0~100 지수로 환산한다.
 */
@Service
@RequiredArgsConstructor
public class RegionRiskService {

    private final RegionMarketStatRepository regionMarketStatRepository;
    private final FraudRegionStatRepository fraudRegionStatRepository;

    @Transactional(readOnly = true)
    public List<RegionRiskDto> getRegionRisks() {
        Map<String, FraudRegionStat> victimBySido = fraudRegionStatRepository.findAll().stream()
                .collect(Collectors.toMap(FraudRegionStat::getSido, Function.identity()));

        return regionMarketStatRepository.findAll().stream()
                .map(market -> toDto(market, victimBySido.get(market.getSido())))
                .sorted((a, b) -> Integer.compare(b.getRiskScore(), a.getRiskScore()))
                .toList();
    }

    private RegionRiskDto toDto(RegionMarketStat market, FraudRegionStat victim) {
        int victimCount = victim != null ? victim.getVictimCount() : 0;
        double share = victim != null ? victim.getShare() : 0.0;

        int score = calculateScore(market, share);

        return RegionRiskDto.builder()
                .sido(market.getSido())
                .riskScore(score)
                .riskLevel(toLevel(score))
                .jeonseRatioApt(market.getJeonseRatioApt())
                .jeonseRatioVilla(market.getJeonseRatioVilla())
                .hugAccidentRate(market.getHugAccidentRate())
                .victimCount(victimCount)
                .share(share)
                .lat(victim != null ? victim.getLat() : 0.0)
                .lng(victim != null ? victim.getLng() : 0.0)
                .basisDate(market.getBasisDate())
                .build();
    }

    /**
     * 가중치: 연립 전세가율 40% + 아파트 전세가율 20% + 피해자 비중 25% + 보증사고율 15%.
     * 각 지표는 관측 범위를 0~1로 정규화한 뒤 합산한다.
     */
    private int calculateScore(RegionMarketStat market, double share) {
        double villa = normalize(market.getJeonseRatioVilla(), 60, 90);
        double apt = normalize(market.getJeonseRatioApt(), 55, 85);
        double victimShare = normalize(share, 0, 26);
        double accident = normalize(market.getHugAccidentRate(), 0, 10);

        double score = villa * 40 + apt * 20 + victimShare * 25 + accident * 15;
        return (int) Math.round(Math.max(0, Math.min(100, score)));
    }

    private double normalize(double value, double min, double max) {
        return Math.max(0, Math.min(1, (value - min) / (max - min)));
    }

    private String toLevel(int score) {
        if (score >= 70) return "위험";
        if (score >= 55) return "주의";
        if (score >= 40) return "보통";
        return "안전";
    }
}
