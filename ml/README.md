# 전세사기 위험 예측 모델 (Deep Learning MLP)

전세 계약 정보를 입력받아 **보증금 미반환(전세사기) 위험 확률**을 예측하는 딥러닝 모델입니다.
학습된 가중치는 JSON으로 내보내 Spring 백엔드(`/api/risk/predict`)가 직접 순전파 추론에 사용합니다.

## 데이터 구성

실제 개별 사기 계약 데이터는 개인정보 문제로 공개되지 않으므로, 공공데이터에서 확인된
위험 규칙·분포를 반영한 **합성 데이터셋 24,000건**으로 학습했습니다.

근거 자료:
- 국토교통부 전세사기피해지원위원회 피해 유형 분석 (주택 유형별 피해 분포, 전세가율 구간)
- 한국부동산원 임대차시장 사이렌 — 지역·유형별 전세가율 분포
- HUG 전세보증금 반환보증 사고 통계 — 보증 가입 여부와 사고율 관계

## 입력 피처 (8개)

| 피처 | 설명 |
|---|---|
| `jeonse_ratio` | 전세가율 = 보증금 / 매매시세 |
| `total_ltv` | (보증금 + 선순위채권) / 매매시세 |
| `is_villa` | 연립·다세대 여부 |
| `is_officetel` | 오피스텔 여부 (기준: 아파트) |
| `has_insurance` | 전세보증금 반환보증 가입 여부 |
| `tax_arrears` | 임대인 국세·지방세 체납 여부 |
| `owner_changed` | 계약 직전 소유권 변동 여부 |
| `region_risk` | 시도별 위험지수 (0~1, `/api/risk/regions` 기반) |

## 모델 구조

- MLP `8 → 24 → 12 → 1` (은닉층 ReLU, 출력층 Sigmoid)
- 표준화(z-score) 후 Adam(lr=1e-3)으로 400 epoch 학습, 검증 정확도 기준 best 모델 선택
- 프레임워크 의존성 없이 numpy로 구현 → 가중치를 JSON으로 직렬화

## 성능 (홀드아웃 테스트 3,600건)

| 지표 | 값 |
|---|---|
| Accuracy | **0.9639** |
| Precision | 0.9636 |
| Recall | 0.9636 |
| F1 | 0.9636 |
| ROC-AUC | 0.9959 |

## 재학습

```bash
python ml/train_risk_model.py
```

산출물 `ml/model/risk_mlp.json`을 `jguard_backend/src/main/resources/model/risk_mlp.json`으로
복사하면 백엔드가 기동 시 새 가중치를 로드합니다.
