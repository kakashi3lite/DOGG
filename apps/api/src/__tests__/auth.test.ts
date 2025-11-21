import request from 'supertest';
import express from 'express';
import { UserModel } from '../models/user';
import authRouter from '../routes/auth';
import { connectDB } from '../db';
import { hashPassword } from '../middleware/security';
import jwt from 'jsonwebtoken';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('Authentication Routes', () => {
  beforeEach(async () => {
    // Clear database before each test
    await UserModel.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    const validUserData = {
      username: 'testuser123',
      email: 'test@example.com',
      password: 'SecurePass123!'
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', validUserData.username);
      expect(response.body.user).toHaveProperty('email', validUserData.email);
      expect(response.body.user).not.toHaveProperty('password');

      // Verify user was created in database
      const user = await UserModel.findOne({ email: validUserData.email });
      expect(user).toBeTruthy();
      expect(user?.username).toBe(validUserData.username);
    });

    it('should reject registration with weak password', async () => {
      const weakPasswordData = {
        ...validUserData,
        password: '123456' // Too weak
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          path: 'password'
        })
      );
    });

    it('should reject registration with invalid email', async () => {
      const invalidEmailData = {
        ...validUserData,
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidEmailData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject registration with duplicate username', async () => {
      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(validUserData);

      // Try to register with same username
      const duplicateData = {
        ...validUserData,
        email: 'different@example.com'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject registration with duplicate email', async () => {
      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(validUserData);

      // Try to register with same email
      const duplicateData = {
        ...validUserData,
        username: 'differentuser'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject registration with short username', async () => {
      const shortUsernameData = {
        ...validUserData,
        username: 'ab' // Too short
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(shortUsernameData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    const userData = {
      username: 'testuser123',
      email: 'test@example.com',
      password: 'SecurePass123!'
    };

    beforeEach(async () => {
      // Create a test user before each login test
      const hashedPassword = await hashPassword(userData.password);
      await UserModel.create({
        username: userData.username,
        email: userData.email,
        password: hashedPassword
      });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', userData.username);
      expect(response.body.user).not.toHaveProperty('password');

      // Verify JWT token
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET!) as any;
      expect(decoded).toHaveProperty('email', userData.email);
    });

    it('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: userData.password
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should reject login with malformed email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: userData.password
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject login with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let validToken: string;
    let userId: string;

    beforeEach(async () => {
      // Create user and generate token
      const user = await UserModel.create({
        username: 'testuser123',
        email: 'test@example.com',
        password: await hashPassword('SecurePass123!')
      });
      userId = user._id.toString();

      validToken = jwt.sign(
        { id: userId, username: user.username, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );
    });

    it('should refresh token successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Token refreshed successfully');
      expect(response.body).toHaveProperty('token');

      // Verify new token is different but valid
      expect(response.body.token).not.toBe(validToken);
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET!) as any;
      expect(decoded.id).toBe(userId);
    });

    it('should reject refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
    });

    it('should reject refresh without token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });

    it('should reject refresh with expired token', async () => {
      const expiredToken = jwt.sign(
        { id: userId, username: 'testuser', email: 'test@example.com' },
        process.env.JWT_SECRET!,
        { expiresIn: '-1h' } // Expired
      );

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
    });
  });

  describe('GET /api/auth/me', () => {
    let validToken: string;
    let user: any;

    beforeEach(async () => {
      // Create user and generate token
      user = await UserModel.create({
        username: 'testuser123',
        email: 'test@example.com',
        password: await hashPassword('SecurePass123!')
      });

      validToken = jwt.sign(
        { id: user._id, username: user.username, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );
    });

    it('should return user info with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', user.username);
      expect(response.body.user).toHaveProperty('email', user.email);
      expect(response.body.user).toHaveProperty('id', user._id.toString());
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
    });
  });

  describe('Rate Limiting', () => {
    // Skip this test in test mode because rate limiting is disabled for tests
    it.skip('should apply rate limiting to auth endpoints', async () => {
      const userData = {
        username: 'testuser123',
        email: 'test@example.com',
        password: 'SecurePass123!'
      };

      // Make multiple requests quickly
      const promises = Array(6).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send(userData)
      );

      const responses = await Promise.all(promises);

      // Some requests should be rate limited (429)
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    }, 10000);
  });
});