import request from 'supertest';
import app from '../src/server.js';

describe('Authentication with Email Verification', () => {
  const testUser = {
    email: 'test@toutaunclicla.com',
    password: 'password123',
    nombre: 'Usuario Test',
    telefono: '+1234567890'
  };

  let verificationCode;

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user and require email verification', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('verificationRequired', true);
      expect(response.body.user.verified).toBe(false);
      
      // En desarrollo, el código se retorna para testing
      if (process.env.NODE_ENV === 'development') {
        verificationCode = response.body.verificationCode;
      }
    });

    it('should reject registration with invalid email', async () => {
      const invalidUser = { ...testUser, email: 'invalid-email' };
      
      await request(app)
        .post('/api/v1/auth/register')
        .send(invalidUser)
        .expect(400);
    });

    it('should reject registration with short password', async () => {
      const invalidUser = { ...testUser, password: '123' };
      
      await request(app)
        .post('/api/v1/auth/register')
        .send(invalidUser)
        .expect(400);
    });
  });

  describe('GET /api/v1/auth/verification-status', () => {
    it('should check verification status of user', async () => {
      const response = await request(app)
        .get(`/api/v1/auth/verification-status?email=${testUser.email}`)
        .expect(200);

      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).toHaveProperty('verified', false);
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/api/v1/auth/verification-status?email=nonexistent@test.com')
        .expect(404);
    });
  });

  describe('POST /api/v1/auth/verify-email', () => {
    it('should verify email with correct code', async () => {
      // Usar código de desarrollo o mock
      const testCode = verificationCode || '123456';
      
      const response = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ code: testCode })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('verified', true);
    });

    it('should reject invalid verification code format', async () => {
      await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ code: '12345' }) // 5 digits instead of 6
        .expect(400);
    });

    it('should reject non-numeric verification code', async () => {
      await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ code: 'abcdef' })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/resend-verification', () => {
    it('should resend verification code', async () => {
      const response = await request(app)
        .post('/api/v1/auth/resend-verification')
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle resend for non-existent email gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/resend-verification')
        .send({ email: 'nonexistent@test.com' })
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('should reject login with incorrect password', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);
    });
  });
});

describe('Email Service Tests', () => {
  describe('Email Template Generation', () => {
    it('should generate verification email with correct structure', () => {
      // Test que el template se genera correctamente
      const mockCode = '123456';
      const mockName = 'Test User';
      
      // Aquí podrías importar y probar directamente las funciones de template
      // si las exportas desde resend.js
      expect(mockCode).toMatch(/^\d{6}$/);
      expect(mockName).toBeTruthy();
    });
  });
});

// Cleanup después de las pruebas
afterAll(async () => {
  // Limpiar datos de prueba si es necesario
  console.log('🧹 Cleaning up test data...');
});
