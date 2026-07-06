package com.jguard.jguard_backend.risk;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/risk")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class RegionRiskController {

    private final RegionRiskService regionRiskService;

    /** 시도별 종합 위험지수 (전국 위험지도용) */
    @GetMapping("/regions")
    public List<RegionRiskDto> getRegionRisks() {
        return regionRiskService.getRegionRisks();
    }
}
