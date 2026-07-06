package com.jguard.jguard_backend.risk;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/risk")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class RegionRiskController {

    private final RegionRiskService regionRiskService;
    private final RiskPredictService riskPredictService;

    /** 시도별 종합 위험지수 (전국 위험지도용) */
    @GetMapping("/regions")
    public List<RegionRiskDto> getRegionRisks() {
        return regionRiskService.getRegionRisks();
    }

    /** AI(딥러닝 MLP) 기반 계약 위험 진단 */
    @PostMapping("/predict")
    public RiskPredictResponse predict(@RequestBody RiskPredictRequest request) {
        return riskPredictService.predict(request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
    }
}
