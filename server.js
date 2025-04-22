import express from 'express';
import { InteractionType, verifyKeyMiddleware } from 'discord-interactions';

const app = express();

// --- PAMIĘĆ STATYSTYK ---
let lastStats = { level: '', xp: '', gold: '' };

// 1) Endpoint do aktualizacji statystyk z rozszerzenia
app.post('/updateStats', express.json(), (req, res) => {
  const { level, xp, gold } = req.body;
  console.log('[Server] Received stats:', req.body);
  lastStats = { level, xp, gold };
  res.sendStatus(204);
});

// 2) Endpoint Interactions – raw body + weryfikacja podpisu
app.post(
  '/interactions',
  express.raw({ type: 'application/json' }),
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  (req, res) => {
    const body = JSON.parse(req.body.toString());

    // Ping / Pong
    if (body.type === InteractionType.PING) {
      return res.send({ type: 1 });
    }

    // Slash Command: /stats
    if (
      body.type === InteractionType.APPLICATION_COMMAND &&
      body.data.name === 'stats'
    ) {
      const stats = lastStats;
      return res.send({
        type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
        data: {
          content: `Poziom: ${stats.level}, XP: ${stats.xp}, Złoto: ${stats.gold}`
        }
      });
    }

    // Inne
    res.sendStatus(400);
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`⚡ Listening on ${PORT}`));
