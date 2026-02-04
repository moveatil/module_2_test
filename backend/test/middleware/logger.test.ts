import { Request, Response, NextFunction } from 'express'
import { requestLogger } from '../../src/middleware/logger'

describe('Request Logger Middleware', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction
  let eventListeners: { [key: string]: Function }

  beforeEach(() => {
    eventListeners = {}

    mockRequest = {
      method: 'GET',
      path: '/test',
    }

    mockResponse = {
      statusCode: 200,
      on: jest.fn((event: string, callback: Function) => {
        eventListeners[event] = callback
        return mockResponse as Response
      }),
    }

    mockNext = jest.fn()

    // console 메서드 모킹
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('requestLogger', () => {
    it('should call next() immediately', () => {
      requestLogger(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('should register finish event listener', () => {
      requestLogger(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(mockResponse.on).toHaveBeenCalledWith('finish', expect.any(Function))
    })

    it('should log info message for 2xx status codes', () => {
      jest.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(1500)
      const consoleLogSpy = jest.spyOn(console, 'log')
      mockResponse.statusCode = 200

      requestLogger(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      // finish 이벤트 발생
      eventListeners.finish()

      expect(consoleLogSpy).toHaveBeenCalledWith('GET /test 200 - 500ms')
    })

    it('should log warning for 4xx status codes', () => {
      jest.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(1500)
      const consoleWarnSpy = jest.spyOn(console, 'warn')
      mockResponse.statusCode = 404

      requestLogger(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      eventListeners.finish()

      expect(consoleWarnSpy).toHaveBeenCalledWith('GET /test 404 - 500ms')
    })

    it('should log error for 5xx status codes', () => {
      jest.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(1500)
      const consoleErrorSpy = jest.spyOn(console, 'error')
      mockResponse.statusCode = 500

      requestLogger(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      eventListeners.finish()

      expect(consoleErrorSpy).toHaveBeenCalledWith('GET /test 500 - 500ms')
    })

    it('should calculate request duration correctly', () => {
      jest.clearAllMocks()
      const consoleLogSpy = jest.spyOn(console, 'log')

      // Date.now 모킹을 새로 설정 - 시작 시간과 종료 시간
      const dateNowSpy = jest.spyOn(Date, 'now')
      dateNowSpy.mockReturnValueOnce(1000) // 시작 시간
      dateNowSpy.mockReturnValueOnce(1250) // 종료 시간

      requestLogger(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      eventListeners.finish()

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('250ms')
      )
    })

    it('should include HTTP method in log', () => {
      jest.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(1500)
      const consoleLogSpy = jest.spyOn(console, 'log')
      const requestWithMethod = {
        ...mockRequest,
        method: 'POST',
      }

      requestLogger(
        requestWithMethod as Request,
        mockResponse as Response,
        mockNext
      )

      eventListeners.finish()

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('POST')
      )
    })

    it('should include request path in log', () => {
      jest.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(1500)
      const consoleLogSpy = jest.spyOn(console, 'log')
      const requestWithPath = {
        ...mockRequest,
        path: '/api/logs',
      }

      requestLogger(
        requestWithPath as Request,
        mockResponse as Response,
        mockNext
      )

      eventListeners.finish()

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/logs')
      )
    })

    it('should handle different status code ranges', () => {
      const testCases = [
        { statusCode: 200, expectedMethod: 'log' },
        { statusCode: 201, expectedMethod: 'log' },
        { statusCode: 301, expectedMethod: 'log' },
        { statusCode: 400, expectedMethod: 'warn' },
        { statusCode: 403, expectedMethod: 'warn' },
        { statusCode: 404, expectedMethod: 'warn' },
        { statusCode: 500, expectedMethod: 'error' },
        { statusCode: 502, expectedMethod: 'error' },
      ]

      testCases.forEach(({ statusCode, expectedMethod }) => {
        jest.clearAllMocks()
        jest.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(1100)

        const spy = jest.spyOn(console, expectedMethod as any)
        mockResponse.statusCode = statusCode

        requestLogger(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        )

        eventListeners.finish()

        expect(spy).toHaveBeenCalled()
      })
    })
  })
})
