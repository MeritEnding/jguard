import logging

import pandas as pd

from .config import DATA_DIR

logger = logging.getLogger(__name__)

# 충북 지역 참고 데이터 (파일명은 공공데이터 원본 그대로, data/ 디렉터리에 배치)
DATA_FILES = {
    "police": "충청북도_경찰청.csv",
    "accidents_latest": "전세금반환보증 사고현황.xlsx",
    "realtors": "충청북도_부동산 중개업정보.csv",
    "accidents_yearly": "충청북도_전세사기 발생건수.csv",
    "rules": "charter_fraud_rule.csv",
}

REGIONS = [
    "상당구", "서원구", "흥덕구", "청원구",
    "청주", "충주", "제천", "보은", "옥천", "영동",
    "증평", "진천", "괴산", "음성", "단양",
]

regional_data: dict[str, pd.DataFrame] = {}


def load_regional_data() -> None:
    """data/ 디렉터리의 참고 데이터를 로드한다. 없는 파일은 건너뛴다."""
    regional_data.clear()
    for key, filename in DATA_FILES.items():
        filepath = DATA_DIR / filename
        if not filepath.exists():
            logger.warning("참고 데이터 없음, 건너뜀: %s", filepath)
            continue
        try:
            if filename.endswith(".csv"):
                try:
                    regional_data[key] = pd.read_csv(filepath, encoding="utf-8")
                except UnicodeDecodeError:
                    regional_data[key] = pd.read_csv(filepath, encoding="cp949")
            elif filename.endswith(".xlsx"):
                regional_data[key] = pd.read_excel(filepath)
        except Exception:
            logger.exception("참고 데이터 로딩 실패: %s", filepath)
    logger.info("지역 참고 데이터 %d종 로딩 완료", len(regional_data))


def get_data_for_region(text_from_doc: str) -> str:
    """문서 텍스트에서 충북 시·군을 찾아 해당 지역 통계를 요약 문자열로 반환한다."""
    if not regional_data:
        return "참고할 지역 데이터가 없습니다."

    found_region = None
    for region in REGIONS:
        if region in text_from_doc:
            found_region = "청주" if region.endswith("구") else region
            break

    if not found_region:
        return "문서에서 충북 지역 정보를 특정할 수 없었습니다."

    report_parts = [f"## 참고: '{found_region}' 지역 데이터"]

    if "accidents_yearly" in regional_data:
        try:
            yearly = regional_data["accidents_yearly"][["구 분", found_region]]
            report_parts.append(f"### 연도별 사고 건수\n{yearly.to_string(index=False)}\n")
        except Exception:
            pass

    if "accidents_latest" in regional_data:
        try:
            target = found_region if found_region.endswith("군") else f"{found_region}시"
            latest = regional_data["accidents_latest"]
            latest = latest[latest["시군구"].str.startswith(target, na=False)]
            if not latest.empty:
                report_parts.append(f"### 최근 3개월 보증사고 현황\n{latest.to_string(index=False)}\n")
        except Exception:
            pass

    if "rules" in regional_data:
        try:
            report_parts.append(f"### 전세사기 판별 규칙\n{regional_data['rules'].to_string(index=False)}\n")
        except Exception:
            pass

    return "\n".join(report_parts)
