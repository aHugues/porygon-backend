const request = require('supertest');
const app = require('../app');

describe('Index endpoint', () => {
  it('should return home page', async () => {
    const res = await request(app).get('/api/v1');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Express');
    expect(res.text).toContain('Welcome to Express');
  });
});

describe('/ endpoint', () => {
  it('should return a 404 error', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(404);
  });
});
