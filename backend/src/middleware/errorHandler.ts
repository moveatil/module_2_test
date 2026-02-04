import { Request, Response, NextFunction } from 'express'
import { ApiResponse, ErrorCode } from '../types'

// 커스텀 에러 클래스
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: ErrorCode,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

// 에러 핸들링 미들웨어
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // 에러 로깅
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  })

  // AppError 처리
  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
      timestamp: new Date().toISOString(),
    }

    // 개발 환경에서만 스택 트레이스 포함
    if (process.env.NODE_ENV === 'development') {
      response.error!.details = {
        ...response.error!.details,
        stack: err.stack,
      }
    }

    return res.status(err.statusCode).json(response)
  }

  // 일반 에러 처리
  const response: ApiResponse = {
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      code: ErrorCode.INTERNAL_ERROR,
    },
    timestamp: new Date().toISOString(),
  }

  // 개발 환경에서만 스택 트레이스 포함
  if (process.env.NODE_ENV === 'development') {
    response.error!.details = {
      stack: err.stack,
    }
  }

  return res.status(500).json(response)
}

// 404 Not Found 핸들러
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const error = new AppError(
    404,
    `Route not found: ${req.method} ${req.path}`,
    ErrorCode.NOT_FOUND
  )
  next(error)
}
