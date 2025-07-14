import type { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/server.ts';

describe('Integration Tests', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = createApp();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('should return OK status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('OK');
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers', async () => {
      const response = await app.inject({
        method: 'OPTIONS',
        url: '/health',
        headers: {
          Origin: 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET',
        },
      });

      expect(response.headers['access-control-allow-origin']).toBe('*');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/non-existent-route',
      });

      expect(response.statusCode).toBe(404);
    });

    it('should handle invalid JSON payload', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: 'invalid json',
        headers: {
          'content-type': 'application/json',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Content-Type Validation', () => {
    it('should require JSON content type for POST requests', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: 'email=test@example.com&password=123',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      });

      // Should still work with proper content type handling
      expect([400, 415]).toContain(response.statusCode);
    });
  });

  describe('Rate Limiting (if implemented)', () => {
    it('should handle multiple requests appropriately', async () => {
      const requests = Array.from({ length: 5 }, () =>
        app.inject({
          method: 'GET',
          url: '/health',
        })
      );

      const responses = await Promise.all(requests);

      // All requests should succeed (no rate limiting implemented yet)
      for (const response of responses) {
        expect(response.statusCode).toBe(200);
      }
    });
  });

  describe('Security Headers', () => {
    it('should not expose sensitive server information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      // Check if server header exists before testing its content
      if (response.headers.server) {
        expect(response.headers.server).not.toContain('Express');
        expect(response.headers.server).not.toContain('Fastify');
      }
      // Test passes if no server header is present (which is good for security)
      expect(response.statusCode).toBe(200);
    });
  });
});
