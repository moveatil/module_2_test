# Backend Test Suite

이 디렉토리는 Log Monitoring System 백엔드의 테스트 코드를 포함합니다.

## 테스트 구조

```
test/
├── setup.ts                          # Jest 테스트 환경 설정
├── app.test.ts                       # Express 앱 통합 테스트
├── routes/
│   └── health.test.ts               # Health check 엔드포인트 테스트
└── middleware/
    ├── errorHandler.test.ts         # 에러 핸들러 미들웨어 테스트
    └── logger.test.ts               # 로깅 미들웨어 테스트
```

## 테스트 실행

### 모든 테스트 실행
```bash
npm test
```

### Watch 모드로 테스트 실행 (개발 중)
```bash
npm run test:watch
```

### 커버리지 리포트 생성
```bash
npm run test:coverage
```

## 현재 테스트 커버리지

- **전체 커버리지**: 98.11% (Statements)
- **브랜치 커버리지**: 81.25%
- **함수 커버리지**: 100%
- **라인 커버리지**: 98%

### 파일별 커버리지
- `middleware/errorHandler.ts`: 96% statements, 75% branches
- `middleware/logger.ts`: 100% (all metrics)
- `routes/health.ts`: 100% statements, 50% branches
- `routes/index.ts`: 100% (all metrics)
- `types/index.ts`: 100% (all metrics)

## 테스트 스위트 상세

### 1. app.test.ts (통합 테스트)
Express 앱의 전체 통합을 테스트합니다.

**테스트 케이스:**
- Root 엔드포인트 응답
- Health check 엔드포인트
- 404 에러 핸들링
- CORS 설정
- JSON Body Parser
- 응답 형식 일관성
- Content-Type 헤더
- HTTP 메서드 지원

### 2. routes/health.test.ts
Health check 엔드포인트의 기능을 테스트합니다.

**테스트 케이스:**
- 200 상태 코드 반환
- success 필드 검증
- health status 검증
- ISO 형식 타임스탬프
- uptime 값 검증
- environment 값 검증
- version 정보 검증
- 응답 구조 검증
- JSON content-type 검증

### 3. middleware/errorHandler.test.ts
에러 핸들링 미들웨어를 테스트합니다.

**테스트 케이스:**
- AppError 클래스 생성 및 속성
- AppError 처리 (상태 코드, 메시지, 에러 코드)
- 에러 details 포함
- 개발 환경에서 스택 트레이스 포함
- 프로덕션 환경에서 스택 트레이스 제외
- 일반 Error 처리
- 에러 로깅
- 404 Not Found 핸들러

### 4. middleware/logger.test.ts
요청 로깅 미들웨어를 테스트합니다.

**테스트 케이스:**
- next() 함수 즉시 호출
- finish 이벤트 리스너 등록
- 2xx 상태 코드에 대한 info 로그
- 4xx 상태 코드에 대한 warning 로그
- 5xx 상태 코드에 대한 error 로그
- 요청 처리 시간 계산
- HTTP 메서드 로그 포함
- 요청 경로 로그 포함
- 다양한 상태 코드 범위 처리

## 테스트 작성 가이드

### 새로운 테스트 파일 추가

1. 해당하는 디렉토리에 `*.test.ts` 파일 생성
2. 테스트 대상 모듈 import
3. `describe` 블록으로 테스트 그룹 정의
4. `it` 또는 `test`로 개별 테스트 케이스 작성

### 예제 구조

```typescript
import { functionToTest } from '../../src/module'

describe('Module Name', () => {
  beforeEach(() => {
    // 각 테스트 전에 실행되는 설정
  })

  afterEach(() => {
    // 각 테스트 후에 실행되는 정리
  })

  describe('functionToTest', () => {
    it('should do something', () => {
      // Given
      const input = 'test'

      // When
      const result = functionToTest(input)

      // Then
      expect(result).toBe('expected')
    })
  })
})
```

### API 엔드포인트 테스트 예제

```typescript
import request from 'supertest'
import app from '../src/server'

describe('GET /api/endpoint', () => {
  it('should return 200', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200)

    expect(response.body).toHaveProperty('success', true)
  })
})
```

## 모킹 (Mocking)

### Console 모킹
```typescript
jest.spyOn(console, 'log').mockImplementation(() => {})
```

### Date 모킹
```typescript
jest.spyOn(Date, 'now')
  .mockReturnValueOnce(1000)
  .mockReturnValueOnce(1500)
```

### Express Request/Response 모킹
```typescript
const mockRequest = {
  method: 'GET',
  path: '/test',
} as Partial<Request>

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
} as Partial<Response>
```

## 주의사항

1. **환경 변수**: 테스트 실행 시 `NODE_ENV=test` 자동 설정
2. **타임아웃**: 기본 타임아웃은 10초로 설정
3. **격리**: 각 테스트는 독립적으로 실행되어야 함
4. **정리**: `afterEach`에서 모킹 정리 (`jest.restoreAllMocks()`)
5. **비동기**: async/await 사용 시 반드시 await 키워드 사용

## 향후 추가 예정

- [ ] 로그 파서 서비스 테스트
- [ ] 로그 분석 서비스 테스트
- [ ] 파일 업로드 엔드포인트 테스트
- [ ] Socket.io 실시간 통신 테스트
- [ ] 데이터베이스 통합 테스트 (추가 시)
- [ ] E2E 테스트

## 참고 문서

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Express Applications](https://expressjs.com/en/advanced/best-practice-performance.html#testing)
