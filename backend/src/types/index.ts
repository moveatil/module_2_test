// API 응답 표준 형식
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    details?: any
  }
  timestamp: string
}

// 로그 레벨
export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'

// 로그 엔트리
export interface LogEntry {
  id: string
  timestamp: Date
  level: LogLevel
  message: string
  source?: string
  metadata?: Record<string, any>
}

// 에러 코드 열거형
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
}
