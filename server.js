const express = require('express');
const jogadorRoutes = require('./routes/jogadorRoutes');
const partidaRoutes = require('./routes/partidaRoutes'); 

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    // eslint-disable-next-line no-unused-vars
    res.send('Bem-vindo à API de Jogadores do Grêmio!');
});

app.use('/api/jogadores', jogadorRoutes);
app.use('/api/partidas', partidaRoutes);

app.use((req, res) => {
     // eslint-disable-next-line no-unused-vars
    res.status(404).json({ message: 'Rota não encontrada' });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
