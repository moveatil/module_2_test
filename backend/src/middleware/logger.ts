import { Request, Response, NextFunction } from 'express'

// 요청 로깅 미들웨어
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now()

  // 응답 완료 시 로깅
  res.on('finish', () => {
    const duration = Date.now() - startTime
    const logMessage = `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`

    // 상태 코드에 따른 로그 레벨 구분
    if (res.statusCode >= 500) {
      console.error(logMessage)
    } else if (res.statusCode >= 400) {
      console.warn(logMessage)
    } else {
      console.log(logMessage)
    }
  })

  next()
}
