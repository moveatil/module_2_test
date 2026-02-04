import { Router, Request, Response } from 'express'
import { ApiResponse } from '../types'

const router = Router()

// 헬스 체크 엔드포인트
router.get('/health', (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    },
    timestamp: new Date().toISOString(),
  }

  res.json(response)
})

export default router
