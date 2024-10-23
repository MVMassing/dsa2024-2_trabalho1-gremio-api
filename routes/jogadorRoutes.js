const express = require('express');
const jogadorController = require('../controllers/jogadorController');
const router = express.Router();

router.post('/', jogadorController.criarJogador);
router.get('/', jogadorController.listarJogadores);
router.get('/:id', jogadorController.buscarJogadorPorId);
router.put('/:id', jogadorController.atualizarJogador);
router.delete('/:id', jogadorController.deletarJogador);

module.exports = router;
