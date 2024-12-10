const request = require("supertest")
const express = require("express")
const partidaRoutes = require("../routes/partidaRoutes")
const pool = require("../db")

const app = express()
app.use(express.json())
app.use("/api/partidas", partidaRoutes)

describe("Partida Controller", () => {
  beforeEach(async () => {
    // Inicia uma transação
    await pool.query("BEGIN")
  })

  afterEach(async () => {
    // Reverte a transação
    await pool.query("ROLLBACK")
  })

  it("Deve criar uma nova partida", async () => {
    const novaPartida = {
      adversario: "Time A",
      data: "2024-11-10",
      local: "Arena do Grêmio",
    }

    const response = await request(app).post("/api/partidas").send(novaPartida)

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("id")
    expect(response.body.adversario).toBe(novaPartida.adversario)
    expect(response.body.local).toBe(novaPartida.local)
  })

  it("Deve listar todas as partidas", async () => {
    const response = await request(app).get("/api/partidas")

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
  })

  it("Deve buscar uma partida por ID", async () => {
    const response = await request(app).get("/api/partidas/1")

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("id", 1)
  })

  it("Deve atualizar uma partida", async () => {
    const response = await request(app)
      .put("/api/partidas/1")
      .send({ adversario: "Time Atualizado" })

    expect(response.status).toBe(200)
    expect(response.body.adversario).toBe("Time Atualizado")
  })

  it("Deve deletar uma partida", async () => {
    const response = await request(app).delete("/api/partidas/1")

    expect(response.status).toBe(200)
  })

  it("Deve retornar 404 ao buscar partida inexistente", async () => {
    const response = await request(app).get("/api/partidas/999")

    expect(response.status).toBe(404)
  })

  // it('Deve registrar gols em uma partida e atualizar o jogador', async () => {
  //   const registroGols = {
  //     jogadorId: 1, // ID do jogador
  //     golsMarcados: 2, // Quantidade de gols marcados
  //   };

  //   const response = await request(app)
  //     .post('/api/partidas/10/gols') // ID da partida
  //     .send(registroGols);

  //   expect(response.status).toBe(200);
  //   expect(response.body.jogadorAtualizado.numGols).toBeGreaterThan(0);
  //   expect(response.body.partidaAtualizada.gols_marcados).toBeGreaterThan(0);
  // });
})
