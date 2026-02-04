# 시스템 로그 분석 웹 어드민

## 프로젝트 개요
시스템 로그를 실시간으로 수집, 분석 및 시각화하는 웹 기반 어드민 대시보드입니다.
로그 파일 업로드, 검색, 필터링, 통계 분석 등의 기능을 제공하여 시스템 모니터링 및 트러블슈팅을 지원합니다.

### 주요 기능
- 로그 파일 업로드 및 파싱
- 실시간 로그 모니터링
- 키워드 검색 및 필터링 (날짜, 로그 레벨, 키워드)
- 로그 통계 및 시각화 (차트, 그래프)
- 로그 레벨별 분류 (ERROR, WARN, INFO, DEBUG)

## 기술 스택

### Frontend
- **React** 18.x
- **TypeScript** 5.x
- **Vite** 5.x (빌드 도구)
- **Chart.js** 4.x (데이터 시각화)
- **Tailwind CSS** 3.x (스타일링)

### Backend
- **Node.js** 20.x LTS
- **Express** 4.x
- **TypeScript** 5.x
- **Socket.io** 4.x (실시간 통신)

### 개발 도구
- **ESLint** 8.x
- **Prettier** 3.x
- **Git**

## 디렉토리 구조

```
module02/
├── frontend/                 # React 프론트엔드
│   ├── public/              # 정적 파일
│   ├── src/
│   │   ├── components/      # 재사용 가능한 컴포넌트
│   │   │   ├── LogViewer/   # 로그 뷰어 컴포넌트
│   │   │   ├── LogFilter/   # 필터링 컴포넌트
│   │   │   ├── Dashboard/   # 대시보드 컴포넌트
│   │   │   └── Chart/       # 차트 컴포넌트
│   │   ├── services/        # API 통신 서비스
│   │   ├── hooks/           # Custom React Hooks
│   │   ├── types/           # TypeScript 타입 정의
│   │   ├── utils/           # 유틸리티 함수
│   │   ├── App.tsx          # 메인 App 컴포넌트
│   │   └── main.tsx         # 진입점
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # Express 백엔드
│   ├── src/
│   │   ├── controllers/     # 라우트 컨트롤러
│   │   ├── services/        # 비즈니스 로직
│   │   │   ├── logParser.ts # 로그 파싱 서비스
│   │   │   └── logAnalyzer.ts # 로그 분석 서비스
│   │   ├── routes/          # API 라우트
│   │   ├── middleware/      # Express 미들웨어
│   │   ├── types/           # TypeScript 타입 정의
│   │   ├── utils/           # 유틸리티 함수
│   │   └── server.ts        # 서버 진입점
│   ├── uploads/             # 업로드된 로그 파일 저장
│   ├── logs/                # 샘플 로그 파일
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## 포팅 매뉴얼

### 사전 요구사항
- Node.js 20.x LTS 이상
- npm 10.x 이상
- Git

### 설치 및 실행

#### 1. 저장소 클론
```bash
git clone <repository-url>
cd module02
```

#### 2. 백엔드 설정 및 실행
```bash
cd backend
npm install
npm run dev
```
- 백엔드 서버: http://localhost:3000

#### 3. 프론트엔드 설정 및 실행
```bash
cd frontend
npm install
npm run dev
```
- 프론트엔드 서버: http://localhost:5173

### 프로덕션 빌드

#### 백엔드 빌드
```bash
cd backend
npm run build
npm start
```

#### 프론트엔드 빌드
```bash
cd frontend
npm run build
```
- 빌드 결과물: `frontend/dist/`

### 환경 변수 설정

#### Backend (.env)
```env
PORT=3000
NODE_ENV=development
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

### 배포

#### Docker를 사용한 배포 (선택사항)
```bash
# Docker 이미지 빌드
docker build -t log-admin .

# 컨테이너 실행
docker run -p 3000:3000 -p 5173:5173 log-admin
```

### 트러블슈팅
- **포트 충돌**: 다른 애플리케이션이 3000 또는 5173 포트를 사용 중인 경우 환경 변수에서 포트 변경
- **CORS 에러**: 백엔드의 CORS 설정 확인
- **파일 업로드 실패**: `uploads/` 디렉토리 권한 및 `MAX_FILE_SIZE` 설정 확인
