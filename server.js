// server.js
import express from 'express';
import { InteractionType, verifyKeyMiddleware } from 'discord-interactions';
import 'dotenv/config';

const app = express();

// --- 1) PAMIĘĆ NAJŚWIEŻSZYCH STATYSTYK ---
let lastStats = { level: '', xp: '', gold: '' };

// --- 2) Endpoint do aktualizacji statystyk z rozszerzenia ---
app.post('/updateStats', express.json(), (req, res) => {
  const { level, xp, gold } = req.body;
  console.log('[Server] Received stats:', req.body);
  lastStats = { level, xp, gold };
  res.sendStatus(204);
});

// --- 3) Endpoint Discord Interactions (/interactions) ---
//     Używamy raw body + verifyKeyMiddleware
app.post(
  '/interactions',
  express.raw({ type: 'application/json' }),
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  (req, res) => {
    const bodyJson = req.body; // już jest obiektem dzięki middleware

    // PING / PONG
    if (bodyJson.type === InteractionType.PING) {
      return res.send({ type: 1 });
    }

    // Slash Command: /stats
    if (
      bodyJson.type === InteractionType.APPLICATION_COMMAND &&
      bodyJson.data.name === 'stats'
    ) {
      const stats = lastStats;
      return res.send({
        type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
        data: {
          content: `Poziom: ${stats.level}, XP: ${stats.xp}, Złoto: ${stats.gold}`
        }
      });
    }

    // Nieznane żądanie
    res.sendStatus(400);
  }
);

// --- 4) START SERWERA ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`⚡ Listening on ${PORT}`));
