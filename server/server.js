const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/towerDefenseDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado ao MongoDB!'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

const scoreSchema = new mongoose.Schema({
    playerName: { type: String, required: true, trim: true },
    score: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

const Score = mongoose.model('Score', scoreSchema);

app.get('/ranking', async (req, res) => {
    try {
        const topScores = await Score.find()
            .sort({ score: -1 })
            .limit(10);
        res.json(topScores);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar o ranking.' });
    }
});

app.post('/ranking', async (req, res) => {
    try {
        const { playerName, score } = req.body;

        if (!playerName || score === undefined) {
            return res.status(400).json({ message: 'playerName e score são obrigatórios.' });
        }

        const newScore = new Score({
            playerName: playerName,
            score: score
        });

        await newScore.save();
        res.status(201).json(newScore);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao salvar a pontuação.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
