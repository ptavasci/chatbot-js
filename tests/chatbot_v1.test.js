const request = require('supertest');
const app = require('../src/app');

describe('ChatBot V1 API', () => {
  it('should respond to a basic greeting', async () => {
    const response = await request(app)
      .post('/chat')
      .send({
        message: 'Hola',
        chat_id: 'test-v1-session'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('response');
    expect(typeof response.body.response).toBe('string');
    expect(response.body.response.length).toBeGreaterThan(0);
  }, 30000); // 30s timeout

  it('should answer questions about IT products', async () => {
    const response = await request(app)
      .post('/chat')
      .send({
        message: '¿Qué procesador tiene la Laptop Lenovo Legion 5 Pro?',
        chat_id: 'test-v1-session'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('response');
    // V1 uses basic RAG, so it should find the info
    expect(response.body.response.toLowerCase()).toMatch(/ryzen 7/);
  }, 30000);
});
