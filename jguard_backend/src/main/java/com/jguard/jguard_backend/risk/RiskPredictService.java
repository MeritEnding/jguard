package com.jguard.jguard_backend.risk;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * 계약 정보를 MLP 입력 피처로 변환해 위험 확률을 예측하고,
 * 요인별 진단과 행동 권고를 함께 생성한다.
 */
@Service
@RequiredArgsConstructor
public class RiskPredictService {

    private final MlpModel mlpModel;
    private final RegionRiskService regionRiskService;

    @Transactional(readOnly = true)
    public RiskPredictResponse predict(RiskPredictRequest req) {
        if (req.getDeposit() <= 0 || req.getMarketPrice() <= 0) {
            throw new IllegalArgumentException("보증금과 매매 시세는 0보다 커야 합니다.");
        }

        double jeonseRatio = (double) req.getDeposit() / req.getMarketPrice();
        double totalLtv = (double) (req.getDeposit() + Math.max(0, req.getSeniorDebt())) / req.getMarketPrice();
        double seniorDebtRatio = (double) Math.max(0, req.getSeniorDebt()) / req.getMarketPrice();
        boolean isVilla = "villa".equalsIgnoreCase(req.getHousingType());
        boolean isOfficetel = "officetel".equalsIgnoreCase(req.getHousingType());
        double regionRisk = resolveRegionRisk(req.getSido());

        double[] features = {
                jeonseRatio,
                totalLtv,
                isVilla ? 1.0 : 0.0,
                isOfficetel ? 1.0 : 0.0,
                req.isHasInsurance() ? 1.0 : 0.0,
                req.isTaxArrears() ? 1.0 : 0.0,
                req.isOwnerChanged() ? 1.0 : 0.0,
                regionRisk,
        };

        double probability = mlpModel.predict(features);
        int score = (int) Math.round(probability * 100);
        String level = toLevel(score);

        return RiskPredictResponse.builder()
                .probability(Math.round(probability * 1000) / 10.0)
                .riskScore(score)
                .riskLevel(level)
                .summary(toSummary(level))
                .factors(buildFactors(req, jeonseRatio, seniorDebtRatio, regionRisk))
                .recommendations(buildRecommendations(req, jeonseRatio, seniorDebtRatio))
                .modelAccuracy(mlpModel.getTestAccuracy())
                .build();
    }

    /** 시도별 위험지수(0~100)를 0~1로 환산. 지역 미지정 시 전국 중간값 사용 */
    private double resolveRegionRisk(String sido) {
        List<RegionRiskDto> regions = regionRiskService.getRegionRisks();
        if (sido != null && !sido.isBlank()) {
            for (RegionRiskDto region : regions) {
                if (region.getSido().equals(sido.trim())) {
                    return region.getRiskScore() / 100.0;
                }
            }
        }
        return regions.isEmpty() ? 0.5
                : regions.get(regions.size() / 2).getRiskScore() / 100.0;
    }

    private String toLevel(int score) {
        if (score >= 70) return "위험";
        if (score >= 45) return "주의";
        if (score >= 25) return "보통";
        return "안전";
    }

    private String toSummary(String level) {
        return switch (level) {
            case "위험" -> "보증금 미반환 가능성이 높은 계약입니다. 계약 전 반드시 전문가 상담을 받으세요.";
            case "주의" -> "위험 요인이 확인됩니다. 아래 권고 사항을 이행한 뒤 계약을 진행하세요.";
            case "보통" -> "일부 주의할 요인이 있으나 관리 가능한 수준입니다.";
            default -> "주요 위험 신호가 낮은 계약입니다. 기본 체크리스트만 확인하세요.";
        };
    }

    private List<RiskPredictResponse.Factor> buildFactors(
            RiskPredictRequest req, double jeonseRatio, double seniorDebtRatio, double regionRisk) {
        List<RiskPredictResponse.Factor> factors = new ArrayList<>();

        factors.add(factor("전세가율", percent(jeonseRatio),
                jeonseRatio >= 0.9 ? "danger" : jeonseRatio >= 0.8 ? "warn" : "safe",
                jeonseRatio >= 0.8
                        ? "보증금이 시세의 " + percent(jeonseRatio) + "로, 집값 하락 시 보증금 전액 회수가 어려울 수 있습니다."
                        : "보증금이 시세 대비 안전한 범위에 있습니다."));

        factors.add(factor("선순위 채권", percent(seniorDebtRatio),
                seniorDebtRatio >= 0.4 ? "danger" : seniorDebtRatio > 0.15 ? "warn" : "safe",
                seniorDebtRatio > 0.15
                        ? "시세의 " + percent(seniorDebtRatio) + "에 해당하는 선순위 채권이 있어 경매 시 변제 순위가 밀립니다."
                        : "선순위 채권 부담이 낮습니다."));

        factors.add(factor("보증보험", req.isHasInsurance() ? "가입" : "미가입",
                req.isHasInsurance() ? "safe" : "warn",
                req.isHasInsurance()
                        ? "반환보증 가입 시 사고가 나도 보증기관이 보증금을 대신 지급합니다."
                        : "반환보증 미가입 상태로, 사고 발생 시 개인이 전액 회수해야 합니다."));

        factors.add(factor("임대인 세금 체납", req.isTaxArrears() ? "체납 있음" : "확인됨/없음",
                req.isTaxArrears() ? "danger" : "safe",
                req.isTaxArrears()
                        ? "체납 세금은 보증금보다 우선 변제되므로 매우 위험한 신호입니다."
                        : "체납 세금으로 인한 우선변제 위험이 없습니다."));

        factors.add(factor("소유권 변동", req.isOwnerChanged() ? "최근 변동" : "안정",
                req.isOwnerChanged() ? "warn" : "safe",
                req.isOwnerChanged()
                        ? "계약 직전 소유권이 바뀐 주택은 무자본 갭투자·바지사장 수법에 자주 이용됩니다."
                        : "소유권이 안정적으로 유지되고 있습니다."));

        String sidoLabel = (req.getSido() == null || req.getSido().isBlank()) ? "전국 평균" : req.getSido();
        factors.add(factor("지역 위험도", sidoLabel + " " + Math.round(regionRisk * 100) + "점",
                regionRisk >= 0.6 ? "warn" : "safe",
                regionRisk >= 0.6
                        ? "해당 지역은 전세가율·피해 통계 기준 위험지수가 높은 편입니다."
                        : "해당 지역의 위험지수는 관리 가능한 수준입니다."));

        return factors;
    }

    private List<String> buildRecommendations(RiskPredictRequest req, double jeonseRatio, double seniorDebtRatio) {
        List<String> recs = new ArrayList<>();
        if (jeonseRatio >= 0.8) {
            recs.add("전세가율이 80%를 넘습니다. 보증금 감액 협의 또는 다른 매물 검토를 권장합니다.");
        }
        if (seniorDebtRatio > 0.15) {
            recs.add("잔금 지급 전 선순위 근저당 말소 또는 감액을 특약으로 명시하세요.");
        }
        if (!req.isHasInsurance()) {
            recs.add("HUG·HF·SGI 전세보증금 반환보증 가입 가능 여부를 계약 전에 확인하세요.");
        }
        if (req.isTaxArrears()) {
            recs.add("임대인 동의를 받아 국세·지방세 완납증명서를 반드시 확인하세요.");
        }
        if (req.isOwnerChanged()) {
            recs.add("등기부등본 갑구의 소유권 이전 이력과 실소유자 신분증을 대조하세요.");
        }
        recs.add("계약 후 30일 이내 임대차 신고로 확정일자를 받고, 이사 당일 전입신고를 완료하세요.");
        return recs;
    }

    private RiskPredictResponse.Factor factor(String name, String value, String status, String description) {
        return RiskPredictResponse.Factor.builder()
                .name(name)
                .value(value)
                .status(status)
                .description(description)
                .build();
    }

    private String percent(double ratio) {
        return Math.round(ratio * 1000) / 10.0 + "%";
    }
}
