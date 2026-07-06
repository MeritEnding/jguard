# JGuard — 충청북도 전세사기 예방 플랫폼

전세 계약 전후에 필요한 정보를 한곳에서 제공해 충북 지역 전세사기 피해를 예방하는 웹 서비스입니다.
지역별 사기 사례 조회, 시군별 피해 현황 지도, 주소 기반 위험도 분석, 예방 가이드, 실시간 뉴스·트렌드, 상담 챗봇, Q&A 커뮤니티를 제공합니다.

## 주요 기능

| 기능 | 설명 |
|------|------|
| 사기 사례 조회 | 시/군/동 단위로 등록된 전세사기 사례 검색 |
| 피해 현황 지도 | 충북 시군별 사기 피해 통계를 지도·차트로 시각화 |
| 위험도 분석 | 주소 기반 전세 위험도 분석 결과 제공 |
| 예방 가이드 | 계약 단계별 체크리스트와 검색어 트렌드 차트 |
| 뉴스 | 전세사기 관련 뉴스 수집·조회, 충북 지역 뉴스 |
| 상담 챗봇 | 공공데이터 기반 전세사기 상담 챗봇 |
| Q&A 게시판 | JWT 인증 기반 질문/답변 커뮤니티 |

## 기술 스택

- **백엔드**: Java 21, Spring Boot 3.5, Spring Security(JWT), Spring Data JPA, H2
- **프론트엔드**: React 19, React Router 7, Axios, Chart.js, Recharts, Leaflet
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
│       ├── chungbuknews/    # 충북 지역 뉴스
│       └── fraudcase/       # 전세사기 사례 조회
└── jguard_frontend/         # React SPA
    └── src/
        ├── api/             # axios 인스턴스(토큰 자동 재발급) + 도메인별 API 모듈
        ├── components/      # 공통 컴포넌트 (Header)
        ├── pages/           # 라우트 단위 페이지
        └── data/            # 지역 데이터 등 정적 리소스
```

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

## 환경변수

| 변수 | 위치 | 설명 |
|------|------|------|
| `JWT_SECRET` | backend | JWT 서명용 Base64 시크릿 |
| `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` | backend | 네이버 뉴스·데이터랩 API |
| `GNEWS_API_KEY` | backend | GNews 검색 API |
| `REACT_APP_API_BASE_URL` | frontend | API 서버 주소 (기본 `http://localhost:8080`) |

## 브랜치 전략 & 커밋 컨벤션

- `main` 배포 · `dev` 통합 · `backend`/`frontend` 파트 통합 · `feat|fix|refactor/영역-설명` 작업 브랜치
- 커밋 메시지: `타입(영역): 요약` (한글, 명령형) — 예: `feat(user): 회원 도메인 모델 및 회원가입 API 구현`
- 작업 항목은 GitHub Issue로 관리하고 커밋에서 `(#이슈번호)`로 참조

자세한 규칙은 [CLAUDE.md](./CLAUDE.md)를 참고하세요.
