# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

시스템 로그를 실시간으로 수집, 분석 및 시각화하는 웹 기반 어드민 대시보드입니다.
React + TypeScript 프론트엔드와 Node.js/Express + TypeScript 백엔드로 구성된 풀스택 애플리케이션입니다.

### 주요 기능
- 로그 파일 업로드 및 파싱
- 실시간 로그 모니터링 (Socket.io)
- 키워드 검색 및 필터링 (날짜, 로그 레벨, 키워드)
- 로그 통계 및 시각화 (Chart.js)
- 로그 레벨별 분류 (ERROR, WARN, INFO, DEBUG)

## 개발 환경 설정

### 필수 요구사항
- Node.js 20.x LTS
- npm 10.x 이상

### 백엔드 개발 서버 실행
```bash
cd backend
npm install
npm run dev
```
- 개발 서버: http://localhost:3000
- TypeScript 파일 변경 시 자동 재시작 (nodemon)

### 프론트엔드 개발 서버 실행
```bash
cd frontend
npm install
npm run dev
```
- 개발 서버: http://localhost:5173
- Vite HMR로 즉시 반영

### 동시 실행 (두 개의 터미널 필요)
```bash
# 터미널 1
cd backend && npm run dev

# 터미널 2
cd frontend && npm run dev
```

## 빌드 명령어

### 백엔드 빌드
```bash
cd backend
npm run build        # TypeScript 컴파일 -> dist/
npm start           # 프로덕션 모드 실행
```

### 프론트엔드 빌드
```bash
cd frontend
npm run build       # 프로덕션 빌드 -> dist/
npm run preview     # 빌드 결과 미리보기
```

## 코드 품질 도구

### 린팅
```bash
# 프론트엔드
cd frontend
npm run lint        # ESLint 실행
npm run lint:fix    # 자동 수정

# 백엔드
cd backend
npm run lint
npm run lint:fix
```

### 포맷팅
```bash
npm run format      # Prettier 실행
```

## 아키텍처 구조

### 프론트엔드 아키텍처

**컴포넌트 계층 구조:**
- `App.tsx`: 최상위 컴포넌트, 라우팅 및 전역 상태 관리
- `components/Dashboard/`: 메인 대시보드 레이아웃과 통계 요약
- `components/LogViewer/`: 로그 목록 표시 및 상세 뷰어
- `components/LogFilter/`: 필터링 UI (날짜, 레벨, 키워드)
- `components/Chart/`: Chart.js 기반 시각화 컴포넌트

**데이터 흐름:**
1. `services/`: Axios 기반 API 클라이언트, RESTful 엔드포인트 호출
2. `hooks/`: 커스텀 훅으로 데이터 페칭 및 상태 관리 로직 캡슐화
3. Socket.io 클라이언트: 실시간 로그 스트림 수신

**타입 시스템:**
- `types/`: 백엔드 API 응답과 일치하는 TypeScript 인터페이스 정의
- 프론트/백엔드 간 타입 동기화 필요

### 백엔드 아키텍처

**레이어 구조:**
```
요청 → routes → controllers → services → 응답
                     ↓
               middleware (인증, 에러 핸들링)
```

**핵심 서비스:**
- `services/logParser.ts`: 다양한 로그 포맷 파싱 (syslog, JSON, custom)
- `services/logAnalyzer.ts`: 로그 통계 분석, 패턴 인식, 집계

**파일 처리:**
- `uploads/`: multer를 통한 파일 업로드 저장 디렉토리
- `logs/`: 샘플 로그 파일 또는 시스템 로그 읽기 위치
- 업로드 파일 크기 제한: 10MB (환경변수 조정 가능)

**실시간 통신:**
- Socket.io 서버: 새로운 로그 이벤트를 연결된 클라이언트에게 브로드캐스트
- 네임스페이스/룸 구조로 필터링된 로그 스트림 제공 가능

## 환경 변수

### Backend (.env)
```env
PORT=3000                    # 서버 포트
NODE_ENV=development         # development | production
UPLOAD_DIR=./uploads         # 업로드 디렉토리 경로
MAX_FILE_SIZE=10485760      # 최대 파일 크기 (10MB)
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000      # 백엔드 API URL
VITE_WS_URL=ws://localhost:3000         # WebSocket URL
```

## API 엔드포인트 설계

### RESTful API
- `POST /api/logs/upload`: 로그 파일 업로드
- `GET /api/logs`: 로그 목록 조회 (페이징, 필터링)
- `GET /api/logs/:id`: 특정 로그 상세 조회
- `GET /api/logs/search`: 키워드 검색
- `GET /api/logs/stats`: 통계 데이터 조회

### WebSocket 이벤트
- `connection`: 클라이언트 연결
- `log:new`: 새로운 로그 이벤트 수신
- `log:subscribe`: 특정 필터 구독
- `disconnect`: 연결 해제

## 타입 정의 공유

프론트엔드와 백엔드 간 타입 일관성 유지:
- 백엔드 `types/` 디렉토리에 공통 타입 정의
- 필요 시 별도 공유 패키지로 분리 고려
- 로그 엔트리 인터페이스:
  ```typescript
  interface LogEntry {
    id: string
    timestamp: Date
    level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'
    message: string
    source?: string
    metadata?: Record<string, any>
  }
  ```

## 개발 워크플로우

1. **새 기능 개발:**
   - 백엔드 타입 및 API 엔드포인트 먼저 작성
   - 프론트엔드 타입 동기화 후 UI 구현
   - 컴포넌트 단위로 개발 및 통합

2. **로그 파서 추가:**
   - `backend/src/services/logParser.ts`에 새 파서 함수 추가
   - 정규식 또는 라이브러리 기반 파싱 로직 구현
   - 테스트 케이스 작성 권장

3. **차트/시각화 추가:**
   - `frontend/src/components/Chart/`에 새 차트 컴포넌트 작성
   - Chart.js 옵션 설정 및 데이터 변환 로직 구현
   - 반응형 디자인 고려

## 트러블슈팅

### 포트 충돌
- 백엔드: `.env`에서 `PORT` 변경
- 프론트엔드: `vite.config.ts`에서 `server.port` 수정

### CORS 에러
- 백엔드 `server.ts`에서 CORS 미들웨어 설정 확인
- 프론트엔드 환경변수 `VITE_API_URL` 확인

### 파일 업로드 실패
- `uploads/` 디렉토리 존재 및 권한 확인
- `MAX_FILE_SIZE` 환경변수 값 확인
- multer 설정 검토

### WebSocket 연결 실패
- Socket.io 버전 호환성 확인 (클라이언트/서버)
- 방화벽 또는 프록시 설정 검토
- `VITE_WS_URL` 환경변수 확인
