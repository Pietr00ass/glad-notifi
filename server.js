// server.js
import express from 'express';
import cors from 'cors';
import { InteractionType, verifyKeyMiddleware } from 'discord-interactions';
import 'dotenv/config';

const app = express();

// 1) Health-check
app.get('/', (req, res) => res.send('OK'));

// 2) Globalne CORS + preflight dla każdej trasy
app.use(cors());
app.options('*', cors());

// 3) JSON parser tylko dla updateStats
app.use('/updateStats', express.json());

// 4) Pamięć na ostatnie statystyki
let lastStats = { level: '', xp: '', gold: '' };

// 5) Endpoint do aktualizacji statystyk
app.post('/updateStats', (req, res) => {
  console.log('[Server] Received stats:', req.body);
  lastStats = req.body;
  res.sendStatus(204);
});

// 6) Endpoint Discord Interactions
app.post(
  '/interactions',
  express.raw({ type: 'application/json' }),
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  (req, res) => {
    console.log('[Server] Interaction payload:', req.body);

    // Pong
    if (req.body.type === InteractionType.PING) {
      return res.send({ type: 1 });
    }
    // /stats
    if (
      req.body.type === InteractionType.APPLICATION_COMMAND &&
      req.body.data.name === 'stats'
    ) {
      const { level, xp, gold } = lastStats;
      return res.send({
        type: 4,
        data: {
          content: `Poziom: ${level}, XP: ${xp}, Złoto: ${gold}`
        }
      });
    }

    res.sendStatus(400);
  }
);

// 7) Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`⚡ Listening on ${PORT}`));
