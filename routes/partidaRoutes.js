const express = require("express")
const partidaController = require("../controllers/partidaController")
const router = express.Router()

router.post("/", partidaController.criarPartida)
router.get("/", partidaController.listarPartidas)
router.get("/:id", partidaController.buscarPartidaPorId)
router.put("/:id", partidaController.atualizarPartida)
router.delete("/:id", partidaController.deletarPartida)

router.put("/:id/gols", partidaController.registrarGols)

module.exports = router
