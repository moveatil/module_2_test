import request from 'supertest'
import express from 'express'
import healthRouter from '../../src/routes/health'

describe('Health Check Route', () => {
  let app: express.Application

  beforeAll(() => {
    app = express()
    app.use(express.json())
    app.use(healthRouter)
  })

  describe('GET /health', () => {
    it('should return 200 status code', async () => {
      const response = await request(app).get('/health')
      expect(response.status).toBe(200)
    })

    it('should return success: true in response', async () => {
      const response = await request(app).get('/health')
      expect(response.body.success).toBe(true)
    })

    it('should return health status as "healthy"', async () => {
      const response = await request(app).get('/health')
      expect(response.body.data.status).toBe('healthy')
    })

    it('should return timestamp in ISO format', async () => {
      const response = await request(app).get('/health')
      expect(response.body.timestamp).toBeDefined()
      expect(response.body.data.timestamp).toBeDefined()

      // ISO 8601 형식 검증
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      expect(response.body.timestamp).toMatch(isoDateRegex)
      expect(response.body.data.timestamp).toMatch(isoDateRegex)
    })

    it('should return uptime as a number', async () => {
      const response = await request(app).get('/health')
      expect(typeof response.body.data.uptime).toBe('number')
      expect(response.body.data.uptime).toBeGreaterThanOrEqual(0)
    })

    it('should return environment', async () => {
      const response = await request(app).get('/health')
      expect(response.body.data.environment).toBeDefined()
      expect(['development', 'production', 'test']).toContain(
        response.body.data.environment
      )
    })

    it('should return version as "1.0.0"', async () => {
      const response = await request(app).get('/health')
      expect(response.body.data.version).toBe('1.0.0')
    })

    it('should have correct response structure', async () => {
      const response = await request(app).get('/health')

      expect(response.body).toHaveProperty('success')
      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('timestamp')

      expect(response.body.data).toHaveProperty('status')
      expect(response.body.data).toHaveProperty('timestamp')
      expect(response.body.data).toHaveProperty('uptime')
      expect(response.body.data).toHaveProperty('environment')
      expect(response.body.data).toHaveProperty('version')
    })

    it('should return JSON content-type', async () => {
      const response = await request(app).get('/health')
      expect(response.headers['content-type']).toMatch(/application\/json/)
    })
  })
})
