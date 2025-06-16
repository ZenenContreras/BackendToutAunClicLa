const request = require('supertest');
const app = require('../src/server');

describe('API Health Check', () => {
  test('GET /health should return 200', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('message', 'API is running');
  });
});

describe('Auth Endpoints', () => {
  test('POST /api/auth/register should validate required fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid-email'
      })
      .expect(400);
    
    expect(response.body).toHaveProperty('error', 'Validation error');
  });

  test('POST /api/auth/login should validate required fields', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({})
      .expect(400);
    
    expect(response.body).toHaveProperty('error', 'Validation error');
  });
});

describe('Product Endpoints', () => {
  test('GET /api/products should return products list', async () => {
    const response = await request(app)
      .get('/api/products')
      .expect(200);
    
    expect(response.body).toHaveProperty('products');
    expect(response.body).toHaveProperty('pagination');
  });
});

describe('Protected Routes', () => {
  test('GET /api/cart should require authentication', async () => {
    const response = await request(app)
      .get('/api/cart')
      .expect(401);
    
    expect(response.body).toHaveProperty('error', 'Access denied');
  });

  test('GET /api/orders/my-orders should require authentication', async () => {
    const response = await request(app)
      .get('/api/orders/my-orders')
      .expect(401);
    
    expect(response.body).toHaveProperty('error', 'Access denied');
  });
});
