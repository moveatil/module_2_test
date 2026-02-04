// Jest 테스트 환경 설정
process.env.NODE_ENV = 'test'
process.env.PORT = '3001'
process.env.CORS_ORIGIN = 'http://localhost:5173'

// 타임아웃 설정
jest.setTimeout(10000)

// 전역 모킹
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}
