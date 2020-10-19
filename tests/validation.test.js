const request = require('supertest');
const app = require('../src/app');

test('Should not allow invalid GitHub repository', async () => {

    await request(app).get('/?repo=-zxa/aaa').send().expect(400);

});