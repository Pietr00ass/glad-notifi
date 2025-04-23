// server.js
import express from 'express';
import { InteractionType, verifyKeyMiddleware } from 'discord-interactions';
import 'dotenv/config';

const app = express();

// PAMIĘĆ: ostatnie statystyki
let lastStats = { level: '', xp: '', gold: '' };

// 1) Endpoint, na który strzelasz z background.js
app.post('/updateStats', express.json(), (req, res) => {
  const { level, xp, gold } = req.body;
  console.log('[Server] Received stats:', req.body);
  lastStats = { level, xp, gold };
  res.sendStatus(204);
});

// 2) Endpoint Discord Interactions: raw body + podpis + obsługa
app.post(
  '/interactions',
  express.raw({ type: 'application/json' }),
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  (req, res) => {
    // req.body jest już obiektem JSON dzięki middleware
    const bodyJson = req.body;
    console.log('[Server] Interaction payload:', bodyJson);

    // PING?
    if (bodyJson.type === InteractionType.PING) {
      return res.send({ type: 1 });
    }

    // /stats?
    if (
      bodyJson.type === InteractionType.APPLICATION_COMMAND &&
      bodyJson.data.name === 'stats'
    ) {
      const { level, xp, gold } = lastStats;
      return res.send({
        type: 4,
        data: {
          content: `Poziom: ${level}, XP: ${xp}, Złoto: ${gold}`
        }
      });
    }

    // Inne: bad request
    return res.sendStatus(400);
  }
);

// Uwaga: nie ma tu nigdzie JSON.parse ani app.use(express.json()) poza updateStats!

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`⚡ Listening on ${PORT}`));
