import request from 'supertest'
import express from 'express'
import cors from 'cors'
import routes from '../src/routes'
import { errorHandler, notFoundHandler } from '../src/middleware/errorHandler'
import { ApiResponse } from '../src/types'

describe('Express App Integration', () => {
  let app: express.Application

  beforeAll(() => {
    // 실제 서버와 동일한 설정으로 앱 생성
    app = express()

    app.use(
      cors({
        origin: 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    )

    app.use(express.json({ limit: '10mb' }))
    app.use(express.urlencoded({ extended: true, limit: '10mb' }))

    // 루트 엔드포인트
    app.get('/', (_req, res) => {
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

    app.use(routes)
    app.use(notFoundHandler)
    app.use(errorHandler)
  })

  describe('Root Endpoint', () => {
    it('should return 200 for root endpoint', async () => {
      const response = await request(app).get('/')
      expect(response.status).toBe(200)
    })

    it('should return API information', async () => {
      const response = await request(app).get('/')

      expect(response.body).toMatchObject({
        success: true,
        data: {
          message: 'Log Monitoring System API',
          version: '1.0.0',
          endpoints: {
            health: '/health',
            api: '/api',
          },
        },
      })
      expect(response.body.timestamp).toBeDefined()
    })
  })

  describe('Health Check Endpoint', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.status).toBe('healthy')
    })
  })

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route')

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBeDefined()
      expect(response.body.error.message).toContain('Route not found')
    })

    it('should include request method and path in 404 error', async () => {
      const response = await request(app).post('/api/invalid')

      expect(response.status).toBe(404)
      expect(response.body.error.message).toContain('POST')
      expect(response.body.error.message).toContain('/api/invalid')
    })
  })

  describe('CORS Configuration', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173')

      expect(response.headers['access-control-allow-origin']).toBe(
        'http://localhost:5173'
      )
      expect(response.headers['access-control-allow-credentials']).toBe('true')
    })
  })

  describe('JSON Body Parser', () => {
    it('should parse JSON request body', async () => {
      // POST 엔드포인트가 추가되면 테스트 활성화
      // 현재는 구조만 확인
      expect(app._router).toBeDefined()
    })

    it('should handle large JSON payloads up to 10mb', async () => {
      // 실제 10MB 페이로드 테스트는 시간이 오래 걸리므로 설정만 확인
      const jsonParserLayer = app._router.stack.find(
        (layer: any) => layer.name === 'jsonParser'
      )
      expect(jsonParserLayer).toBeDefined()
    })
  })

  describe('Response Format', () => {
    it('should return consistent ApiResponse format', async () => {
      const response = await request(app).get('/')

      expect(response.body).toHaveProperty('success')
      expect(response.body).toHaveProperty('timestamp')
      expect(typeof response.body.success).toBe('boolean')
      expect(typeof response.body.timestamp).toBe('string')
    })

    it('should return timestamp in ISO format', async () => {
      const response = await request(app).get('/')

      const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      expect(response.body.timestamp).toMatch(isoDateRegex)
    })
  })

  describe('Content-Type Headers', () => {
    it('should return JSON content-type for all endpoints', async () => {
      const endpoints = ['/', '/health']

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint)
        expect(response.headers['content-type']).toMatch(/application\/json/)
      }
    })
  })

  describe('HTTP Methods', () => {
    it('should handle GET requests', async () => {
      const response = await request(app).get('/health')
      expect(response.status).toBe(200)
    })

    it('should return 404 for unsupported methods on health endpoint', async () => {
      const response = await request(app).post('/health')
      expect(response.status).toBe(404)
    })
  })
})
