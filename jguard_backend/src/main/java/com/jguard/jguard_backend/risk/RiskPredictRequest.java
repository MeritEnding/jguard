package com.jguard.jguard_backend.risk;

import lombok.Getter;
import lombok.Setter;

/** AI 위험 진단 요청 (금액 단위: 만원) */
@Getter
@Setter
public class RiskPredictRequest {

    /** 전세 보증금 */
    private long deposit;

    /** 주택 매매 시세 */
    private long marketPrice;

    /** 등기부등본상 선순위 채권 총액 (근저당 등) */
    private long seniorDebt;

    /** 주택 유형: villa | officetel | apartment */
    private String housingType;

    /** 전세보증금 반환보증 가입 (예정) 여부 */
    private boolean hasInsurance;

    /** 임대인 국세·지방세 체납 여부 */
    private boolean taxArrears;

    /** 계약 직전 소유권 변동 여부 */
    private boolean ownerChanged;

    /** 시도명 (예: 서울, 경기) */
    private String sido;
}
