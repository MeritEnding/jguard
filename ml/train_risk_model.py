# -*- coding: utf-8 -*-
"""전세사기 위험 예측 MLP 학습 스크립트.

국토교통부 전세사기 피해 유형 분석·HUG 보증사고 통계에서 확인된 위험 규칙
(전세가율, 선순위 채권, 주택 유형, 임대인 체납, 보증보험 가입 여부, 지역 위험도)을
반영해 학습 데이터셋을 합성하고, 3층 MLP를 학습한 뒤 가중치를 JSON으로 내보낸다.

출력: ml/model/risk_mlp.json (Spring 백엔드가 로드해 순전파 추론에 사용)

사용법:
    python ml/train_risk_model.py
"""

import json
import os
from datetime import date

import numpy as np

SEED = 42
N_SAMPLES = 24000
HIDDEN = (24, 12)
EPOCHS = 400
BATCH = 256
LR = 1e-3
TARGET_ACCURACY = 0.95

FEATURE_NAMES = [
    "jeonse_ratio",      # 전세가율 = 보증금 / 매매시세
    "total_ltv",         # (보증금 + 선순위채권) / 매매시세
    "is_villa",          # 연립·다세대 여부
    "is_officetel",      # 오피스텔 여부 (기준: 아파트)
    "has_insurance",     # 전세보증금 반환보증 가입 여부
    "tax_arrears",       # 임대인 국세·지방세 체납 여부
    "owner_changed",     # 계약 직전 소유권 변동 여부
    "region_risk",       # 지역 위험지수 (0~1)
]


def generate_dataset(n, rng):
    """공공데이터에서 관찰된 분포·위험 규칙 기반의 합성 데이터셋."""
    # 주택 유형: 피해 통계상 연립·다세대가 최다 (villa 45% / officetel 25% / apt 30%)
    housing = rng.choice(3, size=n, p=[0.45, 0.25, 0.30])
    is_villa = (housing == 0).astype(float)
    is_officetel = (housing == 1).astype(float)

    # 전세가율: 유형별 평균이 다름 (한국부동산원 임대차 사이렌 분포 근사)
    base_ratio = np.where(housing == 0, 0.80, np.where(housing == 1, 0.76, 0.66))
    jeonse_ratio = np.clip(rng.normal(base_ratio, 0.12), 0.30, 1.25)

    # 선순위 채권 비율: 60%는 무담보, 나머지는 지수 분포
    senior_debt = np.where(
        rng.random(n) < 0.60, 0.0, np.clip(rng.exponential(0.22, n), 0.0, 0.75)
    )
    total_ltv = np.clip(jeonse_ratio + senior_debt, 0.30, 2.0)

    has_insurance = (rng.random(n) < 0.35).astype(float)
    tax_arrears = (rng.random(n) < 0.08).astype(float)
    owner_changed = (rng.random(n) < 0.12).astype(float)
    region_risk = rng.beta(2.5, 2.5, n)

    # 잠재 위험 점수: 확인된 위험 요인의 가중 합 + 관측 노이즈
    z = (
        7.0 * (jeonse_ratio - 0.80)
        + 4.5 * np.maximum(0.0, total_ltv - 0.90)
        + 0.55 * is_villa
        + 0.30 * is_officetel
        + 1.30 * tax_arrears
        + 0.90 * owner_changed
        + 1.00 * (region_risk - 0.5)
        - 0.90 * has_insurance
        + rng.normal(0.0, 0.15, n)
    )
    y = (z > 0.0).astype(float)

    X = np.column_stack([
        jeonse_ratio, total_ltv, is_villa, is_officetel,
        has_insurance, tax_arrears, owner_changed, region_risk,
    ])
    return X, y


# ---------------------------------------------------------------------------
# MLP (numpy 구현)
# ---------------------------------------------------------------------------

def init_params(sizes, rng):
    params = []
    for fan_in, fan_out in zip(sizes[:-1], sizes[1:]):
        w = rng.normal(0.0, np.sqrt(2.0 / fan_in), (fan_in, fan_out))
        b = np.zeros(fan_out)
        params.append([w, b])
    return params


def forward(params, x):
    """은닉층 ReLU, 출력층 sigmoid. 역전파용 캐시 반환."""
    caches = []
    a = x
    for i, (w, b) in enumerate(params):
        pre = a @ w + b
        caches.append((a, pre))
        a = 1.0 / (1.0 + np.exp(-pre)) if i == len(params) - 1 else np.maximum(0.0, pre)
    return a, caches


def backward(params, caches, y_hat, y):
    grads = []
    m = len(y)
    delta = (y_hat - y[:, None]) / m  # BCE + sigmoid의 출력층 그래디언트
    for i in reversed(range(len(params))):
        a_prev, pre = caches[i]
        if i != len(params) - 1:
            delta = delta * (pre > 0.0)
        grads.insert(0, [a_prev.T @ delta, delta.sum(axis=0)])
        if i != 0:
            delta = delta @ params[i][0].T
    return grads


def train(X_tr, y_tr, X_val, y_val, rng):
    sizes = [X_tr.shape[1], *HIDDEN, 1]
    params = init_params(sizes, rng)

    # Adam 상태
    ms = [[np.zeros_like(w), np.zeros_like(b)] for w, b in params]
    vs = [[np.zeros_like(w), np.zeros_like(b)] for w, b in params]
    beta1, beta2, eps = 0.9, 0.999, 1e-8
    t = 0

    best_val, best_params = 0.0, None
    idx = np.arange(len(X_tr))
    for epoch in range(EPOCHS):
        rng.shuffle(idx)
        for start in range(0, len(idx), BATCH):
            batch = idx[start:start + BATCH]
            y_hat, caches = forward(params, X_tr[batch])
            grads = backward(params, caches, y_hat, y_tr[batch])
            t += 1
            for layer, ((gw, gb), m_st, v_st) in enumerate(zip(grads, ms, vs)):
                for k, g in enumerate((gw, gb)):
                    m_st[k] = beta1 * m_st[k] + (1 - beta1) * g
                    v_st[k] = beta2 * v_st[k] + (1 - beta2) * g * g
                    m_hat = m_st[k] / (1 - beta1 ** t)
                    v_hat = v_st[k] / (1 - beta2 ** t)
                    params[layer][k] -= LR * m_hat / (np.sqrt(v_hat) + eps)

        val_acc = accuracy(params, X_val, y_val)
        if val_acc > best_val:
            best_val = val_acc
            best_params = [[w.copy(), b.copy()] for w, b in params]
        if (epoch + 1) % 50 == 0:
            print(f"  epoch {epoch + 1:3d}/{EPOCHS}  val_acc={val_acc:.4f}")

    return best_params, best_val


def predict_proba(params, X):
    return forward(params, X)[0].ravel()


def accuracy(params, X, y):
    return float(((predict_proba(params, X) >= 0.5) == (y == 1.0)).mean())


def auc_score(y_true, scores):
    order = np.argsort(scores)
    ranks = np.empty_like(order, dtype=float)
    ranks[order] = np.arange(1, len(scores) + 1)
    pos = y_true == 1.0
    n_pos, n_neg = pos.sum(), (~pos).sum()
    return float((ranks[pos].sum() - n_pos * (n_pos + 1) / 2) / (n_pos * n_neg))


def main():
    rng = np.random.default_rng(SEED)
    X, y = generate_dataset(N_SAMPLES, rng)

    # 70 / 15 / 15 분할
    n_tr = int(len(X) * 0.70)
    n_val = int(len(X) * 0.85)
    perm = rng.permutation(len(X))
    X, y = X[perm], y[perm]
    X_tr, X_val, X_te = X[:n_tr], X[n_tr:n_val], X[n_val:]
    y_tr, y_val, y_te = y[:n_tr], y[n_tr:n_val], y[n_val:]

    # 표준화 (학습 데이터 기준)
    mean, std = X_tr.mean(axis=0), X_tr.std(axis=0)
    std[std == 0] = 1.0
    scale = lambda a: (a - mean) / std  # noqa: E731

    print(f"학습 시작: {len(X_tr)} train / {len(X_val)} val / {len(X_te)} test")
    params, best_val = train(scale(X_tr), y_tr, scale(X_val), y_val, rng)

    proba = predict_proba(params, scale(X_te))
    pred = proba >= 0.5
    actual = y_te == 1.0
    acc = float((pred == actual).mean())
    tp = float((pred & actual).sum())
    precision = tp / max(pred.sum(), 1)
    recall = tp / max(actual.sum(), 1)
    f1 = 2 * precision * recall / max(precision + recall, 1e-12)
    auc = auc_score(y_te, proba)

    print("\n=== 테스트 성능 ===")
    print(f"accuracy : {acc:.4f}")
    print(f"precision: {precision:.4f}")
    print(f"recall   : {recall:.4f}")
    print(f"f1       : {f1:.4f}")
    print(f"roc_auc  : {auc:.4f}")

    assert acc >= TARGET_ACCURACY, f"목표 정확도({TARGET_ACCURACY}) 미달: {acc:.4f}"

    model = {
        "model_type": "mlp",
        "trained_at": date.today().isoformat(),
        "feature_names": FEATURE_NAMES,
        "scaler": {"mean": mean.tolist(), "std": std.tolist()},
        "layers": [
            {
                "weights": w.tolist(),
                "biases": b.tolist(),
                "activation": "sigmoid" if i == len(params) - 1 else "relu",
            }
            for i, (w, b) in enumerate(params)
        ],
        "metrics": {
            "test_accuracy": round(acc, 4),
            "test_precision": round(precision, 4),
            "test_recall": round(recall, 4),
            "test_f1": round(f1, 4),
            "test_roc_auc": round(auc, 4),
            "val_accuracy": round(best_val, 4),
            "n_train": int(n_tr),
            "n_test": int(len(X_te)),
        },
    }

    out_dir = os.path.join(os.path.dirname(__file__), "model")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "risk_mlp.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(model, f, ensure_ascii=False)
    print(f"\n모델 저장: {out_path}")


if __name__ == "__main__":
    main()
