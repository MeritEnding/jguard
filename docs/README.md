# 🏠 전세사기 예방 챗봇

> 전세 계약 전 필수!  
> 생성형 AI 기반으로 사용자 맞춤형 질문을 통해 전세사기 위험을 사전에 진단해주는 챗봇 시스템입니다.

---

## 📌 프로젝트 개요

**전세사기 예방 챗봇**은 사용자에게 상황 맞춤형 질문을 던지고, 그에 따른 응답을 분석하여 전세사기 위험 여부를 안내하는 **AI 기반 챗봇 서비스**입니다.  
LLM(Language Model)을 활용한 자연어 처리 기술과, 프론트/백엔드가 분리된 웹 구조를 통해 사용자 편의성과 기능 확장성을 모두 고려하였습니다.

---

## 🚀 주요 기능

- ✅ 전세사기 위험도 진단용 챗봇 대화 시나리오 제공
- 🧠 LLM 기반 자연어 이해 및 사용자 맞춤형 응답
- 📁 계약 전 정보 확인, 계약 진행 중, 보증 및 금융 등 단계별 질문 분류
- 🔐 Spring Boot 기반의 안전한 API 서버
- 💬 React.js 기반 사용자 친화적인 챗봇 인터페이스
- 🛡️ 전세보증보험 정보, 법률 정보 등의 외부 연동 가능성 고려

---

## 🛠️ 기술 스택

| 구분 | 기술 |
|------|------|
| 🧠 AI | OpenAI GPT-4 API (LLM) |
| 🖥️ Frontend | React.js, TypeScript, Axios, styled-components |
| 🖥️ Backend | Spring Boot, Spring Security, JPA, MySQL |
| 🔗 통신 | RESTful API |
| 🐳 인프라 (선택) | Docker, Nginx, GitHub Actions (CI/CD) |
| 📦 배포 (선택) | AWS EC2, S3, RDS 등 |

---

## 📁 프로젝트 구조

JGuard/
│
├── frontend/ # React 기반 사용자 인터페이스
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── api/ # 백엔드와 통신
│ │ └── ...
│ └── package.json
│
├── backend/ # Spring Boot 기반 REST API 서버
│ ├── src/
│ │ └── main/java/com/example/chatbot/
│ │ ├── controller/
│ │ ├── service/
│ │ ├── dto/
│ │ └── ...
│ ├── application.yml
│ └── build.gradle
│
├── docs/ # 기획 문서, 시나리오, API 명세 등
│ └── chatbot-scenarios.md
│
├── README.md
└── docker-compose.yml (선택)
