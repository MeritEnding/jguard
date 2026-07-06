package com.jguard.jguard_backend.fraudcase;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/fraud")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class FraudStatsController {

    private final FraudRegionStatRepository fraudRegionStatRepository;

    /** 시도별 전세사기 피해자 결정 현황 (전국 지도·차트용) */
    @GetMapping("/stats")
    public List<FraudRegionStat> getRegionStats() {
        return fraudRegionStatRepository.findAll();
    }
}
