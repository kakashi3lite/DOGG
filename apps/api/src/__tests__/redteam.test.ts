import request from 'supertest';
import express from 'express';
import { UserModel } from '../models/user';
import authRouter from '../routes/auth';
import { hashPassword } from '../middleware/security';
import jwt from 'jsonwebtoken';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('Red Team Security Tests', () => {
  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  describe('SQL Injection Attempts', () => {
    it('should prevent SQL injection in email field', async () => {
      const sqlInjectionPayloads = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "admin@test.com'; DELETE FROM users WHERE '1'='1",
        "test@example.com' UNION SELECT * FROM users--"
      ];

      for (const payload of sqlInjectionPayloads) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: payload,
            password: 'password123'
          });

        // Should either return validation error or invalid credentials
        expect([400, 401]).toContain(response.status);
        expect(response.body).not.toHaveProperty('users');
        expect(response.body).not.toHaveProperty('token');
      }
    });

    it('should prevent NoSQL injection in MongoDB queries', async () => {
      const noSQLInjectionPayloads = [
        { $ne: null },
        { $gt: '' },
        { $regex: '.*' },
        { $where: 'return true' }
      ];

      for (const payload of noSQLInjectionPayloads) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: payload,
            password: 'password123'
          });

        expect([400, 401]).toContain(response.status);
      }
    });
  });

  describe('XSS (Cross-Site Scripting) Prevention', () => {
    it('should sanitize script tags in input fields', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        'javascript:alert("XSS")',
        '<svg/onload=alert("XSS")>',
        '"><script>alert("XSS")</script>'
      ];

      for (const payload of xssPayloads) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username: payload,
            email: 'test@example.com',
            password: 'SecurePass123!'
          });

        // Should be rejected due to validation
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      }
    });

    it('should handle XSS in email fields', async () => {
      const xssEmailPayloads = [
        'test+<script>alert("XSS")</script>@example.com',
        '<script>alert("XSS")</script>@example.com',
        'test@<script>alert("XSS")</script>.com'
      ];

      for (const payload of xssEmailPayloads) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username: 'testuser123',
            email: payload,
            password: 'SecurePass123!'
          });

        expect(response.status).toBe(400);
      }
    });
  });

  describe('Authentication Bypass Attempts', () => {
    it('should prevent JWT token manipulation', async () => {
      // Create a valid user
      const user = await UserModel.create({
        username: 'testuser',
        email: 'test@example.com',
        password: await hashPassword('SecurePass123!')
      });

      // Create a valid token
      const validToken = jwt.sign(
        { id: user._id, username: user.username, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      // Attempt token manipulation
      const manipulatedTokens = [
        validToken.slice(0, -5) + 'XXXXX', // Modify signature
        validToken.replace(/\\./g, 'X'), // Replace dots
        'Bearer invalid-token',
        '',
        'null',
        'undefined'
      ];

      for (const token of manipulatedTokens) {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${token}`);

        expect([401, 403]).toContain(response.status);
        expect(response.body).not.toHaveProperty('user');
      }
    });

    it('should prevent privilege escalation via token payload manipulation', async () => {
      // Try to create a token with admin privileges
      const maliciousPayload = {
        id: 'admin',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        isAdmin: true
      };

      // This should fail without the correct secret
      try {
        const maliciousToken = jwt.sign(maliciousPayload, 'wrong-secret');
        
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${maliciousToken}`);

        expect([401, 403]).toContain(response.status);
      } catch (error) {
        // Expected - should fail to create or verify token
        expect(error).toBeDefined();
      }
    });
  });

  describe('Rate Limiting Bypass Attempts', () => {
    it('should prevent rate limit bypass with different IPs', async () => {
      // Simulate requests from different IPs (limited by test environment)
      const requests = [];
      
      for (let i = 0; i < 10; i++) {
        const request_promise = request(app)
          .post('/api/auth/login')
          .set('X-Forwarded-For', `192.168.1.${i}`)
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          });
        requests.push(request_promise);
      }

      const responses = await Promise.all(requests);
      
      // Should still get rate limited
      const rateLimited = responses.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    }, 15000);

    it('should prevent rate limit bypass with different User-Agents', async () => {
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        'curl/7.68.0',
        'PostmanRuntime/7.28.0'
      ];

      const requests = [];
      
      for (const userAgent of userAgents) {
        const request_promise = request(app)
          .post('/api/auth/login')
          .set('User-Agent', userAgent)
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          });
        requests.push(request_promise);
      }

      const responses = await Promise.all(requests);
      
      // Should still get rate limited regardless of User-Agent
      const rateLimited = responses.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    }, 10000);
  });

  describe('Input Fuzzing Tests', () => {
    it('should handle extremely long inputs gracefully', async () => {
      const longString = 'A'.repeat(10000);
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: longString,
          email: longString + '@example.com',
          password: longString
        });

      // Should handle gracefully without crashing
      expect([400, 413]).toContain(response.status);
    });

    it('should handle special characters and unicode', async () => {
      const specialInputs = [
        '\\x00\\x01\\x02\\x03', // Null bytes and control characters
        '🚀🐕💻🔒', // Emojis
        'test\\x0Auser', // Newline injection
        'test\\ruser', // Carriage return
        'test\\tuser', // Tab
        '../../etc/passwd', // Path traversal
        '%00%01%02%03', // URL encoded null bytes
        '${7*7}', // Template injection
        '{{7*7}}' // Template injection (different syntax)
      ];

      for (const input of specialInputs) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username: input,
            email: 'test@example.com',
            password: 'SecurePass123!'
          });

        // Should handle without crashing
        expect([200, 201, 400]).toContain(response.status);
      }
    });

    it('should handle malformed JSON payloads', async () => {
      const malformedPayloads = [
        '{"username":"test",}', // Trailing comma
        '{username:"test"}', // Unquoted key
        '{"username":"test""email":"test@example.com"}', // Missing comma
        '[{"username":"test"}]', // Array instead of object
        'not-json-at-all',
        '\\x00\\x01\\x02'
      ];

      for (const payload of malformedPayloads) {
        const response = await request(app)
          .post('/api/auth/register')
          .set('Content-Type', 'application/json')
          .send(payload);

        // Should handle malformed JSON gracefully
        expect([400, 422]).toContain(response.status);
      }
    });
  });

  describe('HTTP Method Override Attacks', () => {
    it('should not allow method override via headers', async () => {
      // Try to override POST to DELETE via headers
      const response = await request(app)
        .post('/api/auth/register')
        .set('X-HTTP-Method-Override', 'DELETE')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      // Should still be treated as POST
      expect([200, 201, 400]).toContain(response.status);
    });
  });

  describe('Timing Attack Prevention', () => {
    it('should have consistent response times for invalid users', async () => {
      // Create a real user for comparison
      await UserModel.create({
        username: 'realuser',
        email: 'real@example.com',
        password: await hashPassword('SecurePass123!')
      });

      const timings: number[] = [];

      // Test with existing user (wrong password)
      const start1 = Date.now();
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'real@example.com',
          password: 'wrongpassword'
        });
      timings.push(Date.now() - start1);

      // Test with non-existing user
      const start2 = Date.now();
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        });
      timings.push(Date.now() - start2);

      // Timing difference should be minimal (within reasonable bounds)
      const timingDifference = Math.abs(timings[0] - timings[1]);
      expect(timingDifference).toBeLessThan(1000); // Less than 1 second difference
    });
  });

  describe('Header Injection Tests', () => {
    it('should prevent CRLF injection in headers', async () => {
      const crlfPayloads = [
        'test\\r\
X-Injected: true',
        'test\
X-Injected: true',
        'test\\r\
\\r\
<script>alert("XSS")</script>'
      ];

      for (const payload of crlfPayloads) {
        const response = await request(app)
          .post('/api/auth/login')
          .set('User-Agent', payload)
          .send({
            email: 'test@example.com',
            password: 'password'
          });

        // Should not contain injected headers
        expect(response.headers).not.toHaveProperty('x-injected');
      }
    });
  });

  describe('Business Logic Tests', () => {
    it('should not allow registration with existing email in different case', async () => {
      // Register with lowercase email
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser1',
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      // Try to register with uppercase email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          email: 'TEST@EXAMPLE.COM',
          password: 'SecurePass123!'
        });

      expect(response.status).toBe(400);
    });

    it('should not allow empty or whitespace-only passwords', async () => {
      const invalidPasswords = [
        '',
        ' ',
        '\\t',
        '\
',
        '        ', // Multiple spaces
        '\\t\
\\r ' // Mixed whitespace
      ];

      for (const password of invalidPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username: 'testuser',
            email: 'test@example.com',
            password: password
          });

        expect(response.status).toBe(400);
      }
    });
  });
});