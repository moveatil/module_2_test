import { Router } from 'express'
import healthRouter from './health'

const router = Router()

// 헬스 체크 라우트 등록
router.use(healthRouter)

// 향후 추가 라우트
// router.use('/api/logs', logsRouter)

export default router
