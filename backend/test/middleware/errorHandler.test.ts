import { Request, Response, NextFunction } from 'express'
import {
  AppError,
  errorHandler,
  notFoundHandler,
} from '../../src/middleware/errorHandler'
import { ErrorCode } from '../../src/types'

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction
  let jsonMock: jest.Mock
  let statusMock: jest.Mock

  beforeEach(() => {
    jsonMock = jest.fn()
    statusMock = jest.fn().mockReturnValue({ json: jsonMock })

    mockRequest = {
      path: '/test-path',
      method: 'GET',
    }

    mockResponse = {
      status: statusMock,
    }

    mockNext = jest.fn()

    // console 메서드 모킹
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('AppError', () => {
    it('should create AppError with all parameters', () => {
      const error = new AppError(
        400,
        'Test error',
        ErrorCode.VALIDATION_ERROR,
        { field: 'email' }
      )

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(AppError)
      expect(error.statusCode).toBe(400)
      expect(error.message).toBe('Test error')
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR)
      expect(error.details).toEqual({ field: 'email' })
      expect(error.name).toBe('AppError')
    })

    it('should create AppError without optional parameters', () => {
      const error = new AppError(500, 'Internal error')

      expect(error.statusCode).toBe(500)
      expect(error.message).toBe('Internal error')
      expect(error.code).toBeUndefined()
      expect(error.details).toBeUndefined()
    })
  })

  describe('errorHandler', () => {
    it('should handle AppError correctly', () => {
      const appError = new AppError(
        404,
        'Resource not found',
        ErrorCode.NOT_FOUND
      )

      errorHandler(
        appError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(statusMock).toHaveBeenCalledWith(404)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: {
            message: 'Resource not found',
            code: ErrorCode.NOT_FOUND,
          },
          timestamp: expect.any(String),
        })
      )
    })

    it('should include details in AppError response', () => {
      const appError = new AppError(
        400,
        'Validation failed',
        ErrorCode.VALIDATION_ERROR,
        { field: 'email', reason: 'Invalid format' }
      )

      errorHandler(
        appError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            details: { field: 'email', reason: 'Invalid format' },
          }),
        })
      )
    })

    it('should include stack trace in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const appError = new AppError(500, 'Test error')

      errorHandler(
        appError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      const callArgs = jsonMock.mock.calls[0][0]
      expect(callArgs.error.details).toHaveProperty('stack')

      process.env.NODE_ENV = originalEnv
    })

    it('should not include stack trace in production mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const appError = new AppError(500, 'Test error', ErrorCode.INTERNAL_ERROR)

      errorHandler(
        appError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      const callArgs = jsonMock.mock.calls[0][0]
      expect(callArgs.error.details).toBeUndefined()

      process.env.NODE_ENV = originalEnv
    })

    it('should handle generic Error correctly', () => {
      const genericError = new Error('Generic error')

      errorHandler(
        genericError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: {
            message: 'Generic error',
            code: ErrorCode.INTERNAL_ERROR,
          },
          timestamp: expect.any(String),
        })
      )
    })

    it('should log error details to console', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error')
      const error = new Error('Test error')

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error:',
        expect.objectContaining({
          message: 'Test error',
          path: '/test-path',
          method: 'GET',
        })
      )
    })
  })

  describe('notFoundHandler', () => {
    it('should create AppError for 404 and pass to next', () => {
      const requestWithPath = {
        ...mockRequest,
        method: 'POST',
        path: '/api/nonexistent',
      }

      notFoundHandler(
        requestWithPath as Request,
        mockResponse as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: 'Route not found: POST /api/nonexistent',
          code: ErrorCode.NOT_FOUND,
        })
      )
    })

    it('should pass AppError instance to next', () => {
      notFoundHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      const passedError = (mockNext as jest.Mock).mock.calls[0][0]
      expect(passedError).toBeInstanceOf(AppError)
    })
  })
})
