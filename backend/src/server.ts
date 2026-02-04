import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/logger'
import routes from './routes'
import { ApiResponse } from './types'

// 환경 변수 로드
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// CORS 설정
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// Body Parser 미들웨어
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 요청 로거 (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger)
}

// 정적 파일 제공 (업로드 디렉토리)
const uploadDir = process.env.UPLOAD_DIR || './uploads'
app.use('/uploads', express.static(path.resolve(uploadDir)))

// 루트 엔드포인트
app.get('/', (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      message: 'Log Monitoring System API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        api: '/api',
      },
    },
    timestamp: new Date().toISOString(),
  }
  res.json(response)
})

// 라우트 등록
app.use(routes)

// 404 핸들러 (라우트 찾지 못한 경우)
app.use(notFoundHandler)

// 에러 핸들러 (마지막에 위치)
app.use(errorHandler)

// 서버 시작
const server = app.listen(PORT, () => {
  console.log('==================================================')
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🏥 Health check: http://localhost:${PORT}/health`)
  console.log('==================================================')
})

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('\n🛑 Shutting down gracefully...')
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })

  // 강제 종료 타임아웃 (10초)
  setTimeout(() => {
    console.error('⚠️  Forced shutdown')
    process.exit(1)
  }, 10000)
}

// 시그널 핸들러
process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// 예외 처리
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  gracefulShutdown()
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  gracefulShutdown()
})

export default app
