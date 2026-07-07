# JGuard — 대한민국 전세사기 예방 플랫폼

공공데이터와 딥러닝 AI로 전국 세입자의 보증금을 지키는 웹 서비스입니다.
전국 17개 시도 위험지도, 딥러닝 기반 계약 위험 진단, 지역별 사기 사례 조회,
예방 가이드, 실시간 뉴스·트렌드, Q&A 커뮤니티를 제공합니다.

## 주요 기능

| 기능 | 설명 |
|------|------|
| AI 위험 진단 | 보증금·시세·권리관계 입력 → 딥러닝 MLP가 위험 확률·요인별 진단·행동 권고 제공 (테스트 정확도 **96.4%**) |
| 전국 위험지도 | 전국 17개 시도 종합 위험지수(전세가율 + 피해 통계 + HUG 사고율)를 지도·순위로 시각화 |
| 사기 사례 조회 | 시/군/동 단위로 등록된 전세사기 사례 검색 |
| 피해 현황 통계 | 시도·시군별 사기 피해 통계를 지도·차트로 시각화 |
| 전세가율 분석 | 지역·주택유형별 전세가율 기반 깡통전세 위험 분석 |
| 예방 가이드 | 계약 단계별 체크리스트와 검색어 트렌드 차트 |
| 뉴스 | 전세사기 관련 뉴스 수집·조회, 지역별 뉴스 |
| AI 문서 분석 | 계약서 업로드 기반 위험 요소 분석 챗봇 |
| Q&A 게시판 | JWT 인증 기반 질문/답변 커뮤니티 |

## AI 위험 예측 모델

- 3층 MLP(`8 → 24 → 12 → 1`, ReLU + Sigmoid)를 numpy로 학습, 가중치를 JSON으로 직렬화해
  Spring 백엔드가 프레임워크 의존성 없이 직접 순전파 추론
- 학습 데이터: 국토부 피해 유형 분석·한국부동산원 전세가율·HUG 보증사고 통계의
  위험 규칙을 반영한 합성 데이터 24,000건
- 홀드아웃 테스트 성능: **Accuracy 0.964 · F1 0.964 · ROC-AUC 0.996**
- 상세 문서와 재학습 방법: [ml/README.md](./ml/README.md)

## 기술 스택

- **백엔드**: Java 21, Spring Boot 3.5, Spring Security(JWT), Spring Data JPA, H2
- **프론트엔드**: React 19, React Router 7, Axios, Chart.js, Recharts, Leaflet
- **ML**: Python 3, numpy (학습) → JSON 가중치 → Java 순전파 (서빙)
- **협업**: GitHub Issues, 브랜치 전략(`main ← dev ← backend | frontend ← feat/*`)

## 프로젝트 구조

```
jguard/
├── jguard_backend/          # Spring Boot API 서버
│   └── src/main/java/com/jguard/jguard_backend/
│       ├── common/          # 전역 예외 처리, 공통 DTO
│       ├── user/ jwt/       # 회원, JWT 인증(액세스/리프레시 토큰)
│       ├── question/ answer/# Q&A 게시판
│       ├── news/            # 뉴스 수집·검색 트렌드 (네이버·GNews API)
│       ├── chungbuknews/    # 지역 뉴스
│       ├── fraudcase/       # 전세사기 사례·시도별 피해 통계
│       └── risk/            # 시도별 위험지수 + 딥러닝 위험 진단 API
├── jguard_frontend/         # React SPA
│   └── src/
│       ├── api/             # axios 인스턴스(토큰 자동 재발급) + 도메인별 API 모듈
│       ├── components/      # 공통 레이아웃 (Header/Footer/Layout)
│       ├── pages/           # 라우트 단위 페이지
│       └── data/            # 지역 데이터 등 정적 리소스
└── ml/                      # 위험 예측 모델 학습 파이프라인 (Python)
```

## 주요 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/risk/regions` | 시도별 종합 위험지수 |
| `POST` | `/api/risk/predict` | 딥러닝 계약 위험 진단 |
| `GET` | `/api/fraud/stats` | 시도별 피해자 결정 현황 |
| `GET` | `/api/fraud/region` | 지역(시/군/동)별 사기 사례 |

## 실행 방법

### 백엔드

```bash
cd jguard_backend
cp src/main/resources/application.properties.example src/main/resources/application.properties
# JWT_SECRET(Base64), NAVER_CLIENT_ID/SECRET, GNEWS_API_KEY 환경변수 설정
./gradlew bootRun
```

### 프론트엔드

```bash
cd jguard_frontend
cp .env.example .env   # 필요 시 REACT_APP_API_BASE_URL 수정
npm install
npm start
```

### 모델 재학습 (선택)

```bash
python ml/train_risk_model.py
cp ml/model/risk_mlp.json jguard_backend/src/main/resources/model/risk_mlp.json
```

## 환경변수

| 변수 | 위치 | 설명 |
|------|------|------|
| `JWT_SECRET` | backend | JWT 서명용 Base64 시크릿 |
| `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` | backend | 네이버 뉴스·데이터랩 API |
| `GNEWS_API_KEY` | backend | GNews 검색 API |
| `REACT_APP_API_BASE_URL` | frontend | API 서버 주소 (기본 `http://localhost:8080`) |

## 데이터 출처

- 국토교통부 전세사기피해지원위원회 — 시도별 피해자 결정 현황
- 한국부동산원 임대차시장 사이렌 — 지역·유형별 전세가율
- 주택도시보증공사(HUG) — 전세보증금 반환보증 사고 통계

> 본 서비스의 통계·진단은 공공데이터 기반 참고 자료이며 법적 효력을 갖지 않습니다.

## 브랜치 전략 & 커밋 컨벤션

- `main` 배포 · `dev` 통합 · `backend`/`frontend` 파트 통합 · `feat|fix|refactor/영역-설명` 작업 브랜치
- 커밋 메시지: `타입(영역): 요약` (한글, 명령형) — 예: `feat(user): 회원 도메인 모델 및 회원가입 API 구현`
- 작업 항목은 GitHub Issue로 관리하고 커밋에서 `(#이슈번호)`로 참조

자세한 규칙은 [CLAUDE.md](./CLAUDE.md)를 참고하세요.
