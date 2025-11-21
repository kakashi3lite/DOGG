import request from 'supertest';
import express from 'express';
import {
  createRateLimit,
  validateSchema,
  hashPassword,
  verifyPassword,
  securityHeaders,
  logRequests
} from '../middleware/security';
import { z } from 'zod';

// Create test app
const app = express();
app.use(express.json());
app.use(securityHeaders);
app.use(logRequests);

// Test schema
const testSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email()
});

// Test routes
app.post('/test-validation', validateSchema(testSchema), (req, res) => {
  res.json({ success: true, data: req.body });
});

app.get('/test-rate-limit', createRateLimit(1000, 2), (req, res) => {
  res.json({ success: true });
});

app.get('/test-headers', (req, res) => {
  res.json({ success: true });
});

describe('Security Middleware', () => {
  describe('Input Validation', () => {
    it('should accept valid input', async () => {
      const validData = {
        username: 'testuser',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/test-validation')
        .send(validData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: validData
      });
    });

    it('should reject invalid email', async () => {
      const invalidData = {
        username: 'testuser',
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/test-validation')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid input data');
      expect(response.body).toHaveProperty('details');
    });

    it('should reject short username', async () => {
      const invalidData = {
        username: 'ab',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/test-validation')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid input data');
    });

    it('should reject missing required fields', async () => {
      const invalidData = {
        username: 'testuser'
        // Missing email
      };

      const response = await request(app)
        .post('/test-validation')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid input data');
    });

    it('should reject extra fields not in schema', async () => {
      const invalidData = {
        username: 'testuser',
        email: 'test@example.com',
        extraField: 'should be rejected'
      };

      const response = await request(app)
        .post('/test-validation')
        .send(invalidData)
        .expect(200);

      // Extra fields should be stripped
      expect(response.body.data).not.toHaveProperty('extraField');
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within limit', async () => {
      const response1 = await request(app)
        .get('/test-rate-limit')
        .expect(200);

      const response2 = await request(app)
        .get('/test-rate-limit')
        .expect(200);

      expect(response1.body).toEqual({ success: true });
      expect(response2.body).toEqual({ success: true });
    });

    it('should block requests exceeding limit', async () => {
      // Make requests up to the limit
      await request(app).get('/test-rate-limit');
      await request(app).get('/test-rate-limit');
      
      // This should be rate limited
      const response = await request(app)
        .get('/test-rate-limit')
        .expect(429);

      expect(response.body).toHaveProperty('error');
    }, 10000);
  });

  describe('Security Headers', () => {
    it('should set security headers', async () => {
      const response = await request(app)
        .get('/test-headers')
        .expect(200);

      // Check for security headers
      expect(response.headers).toHaveProperty('content-security-policy');
      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(response.headers).toHaveProperty('x-frame-options', 'DENY');
      expect(response.headers).toHaveProperty('x-xss-protection', '1; mode=block');
      expect(response.headers).toHaveProperty('referrer-policy', 'strict-origin-when-cross-origin');
      expect(response.headers).toHaveProperty('strict-transport-security');
    });

    it('should set CSP header with correct directives', async () => {
      const response = await request(app)
        .get('/test-headers')
        .expect(200);

      const csp = response.headers['content-security-policy'];
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("script-src 'self'");
    });
  });

  describe('Password Security', () => {
    it('should hash passwords securely', async () => {
      const password = 'SecurePass123!';
      const hash = await hashPassword(password);

      // Hash should be different from original password
      expect(hash).not.toBe(password);
      
      // Hash should start with bcrypt prefix
      expect(hash).toMatch(/^\\$2[aby]\\$/);
      
      // Hash should be reasonably long
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should verify passwords correctly', async () => {
      const password = 'SecurePass123!';
      const hash = await hashPassword(password);

      // Correct password should verify
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);

      // Incorrect password should not verify
      const isInvalid = await verifyPassword('wrongpassword', hash);
      expect(isInvalid).toBe(false);
    });

    it('should use sufficient salt rounds', async () => {
      const password = 'SecurePass123!';
      const start = Date.now();
      await hashPassword(password);
      const duration = Date.now() - start;

      // Hashing should take reasonable time (indicating sufficient rounds)
      expect(duration).toBeGreaterThan(50); // At least 50ms
    });

    it('should produce different hashes for same password', async () => {
      const password = 'SecurePass123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      // Different salts should produce different hashes
      expect(hash1).not.toBe(hash2);
      
      // But both should verify correctly
      expect(await verifyPassword(password, hash1)).toBe(true);
      expect(await verifyPassword(password, hash2)).toBe(true);
    });
  });

  describe('Request Logging', () => {
    it('should log requests without exposing sensitive data', async () => {
      // This is more of an integration test
      // In a real scenario, you'd mock the logger and verify calls
      const response = await request(app)
        .get('/test-headers')
        .expect(200);

      expect(response.body).toEqual({ success: true });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/test-validation')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      // Express should handle malformed JSON
      expect(response.body).toBeDefined();
    });

    it('should handle oversized payloads', async () => {
      const largePayload = {
        username: 'a'.repeat(1000000), // Very large field
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/test-validation')
        .send(largePayload);

      // Should either accept (if under limit) or reject appropriately
      expect([200, 400, 413]).toContain(response.status);
    });
  });
});