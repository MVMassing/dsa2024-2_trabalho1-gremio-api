const request = require('supertest');
const express = require('express');
const jogadorRoutes = require('../routes/jogadorRoutes');

const app = express();
app.use(express.json());
app.use('/api/jogadores', jogadorRoutes);

describe('Jogador Controller', () => {
  it('Deve criar um novo jogador', async () => {
    const novoJogador = {
      nome: "Teste Jogador",
      posicao: "Atacante",
      numero: 9,
      idade: 25,
      nacionalidade: "Brasileiro"
    };

    const response = await request(app)
      .post('/api/jogadores')
      .send(novoJogador);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.nome).toBe(novoJogador.nome);
  });

  it('Deve listar todos os jogadores', async () => {
    const response = await request(app).get('/api/jogadores');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('Deve buscar um jogador por ID', async () => {
    const response = await request(app).get('/api/jogadores/1');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
  });

  it('Deve atualizar um jogador', async () => {
    const response = await request(app)
      .put('/api/jogadores/1')
      .send({ nome: "Jogador Atualizado" });

    expect(response.status).toBe(200);
    expect(response.body.nome).toBe("Jogador Atualizado");
  });

  it('Deve deletar um jogador', async () => {
    const response = await request(app).delete('/api/jogadores/1');

    expect(response.status).toBe(204);
  });

  it('Deve retornar 404 ao buscar jogador inexistente', async () => {
    const response = await request(app).get('/api/jogadores/999');

    expect(response.status).toBe(404);
  });
});
