// server.js
import express from 'express';
import cors from 'cors';
import { InteractionType, verifyKeyMiddleware } from 'discord-interactions';
import 'dotenv/config';

const app = express();

// --- 1) Globalne CORS ---
app.use(cors());
// Obsługa preflight tylko dla updateStats
app.options('/updateStats', cors());

// --- 2) Pamięć na ostatnie statystyki ---
let lastStats = { level: '', xp: '', gold: '' };

// --- 3) Endpoint do aktualizacji statystyk ---
app.post('/updateStats', express.json(), (req, res) => {
  const { level, xp, gold } = req.body;
  console.log('[Server] Received stats:', req.body);
  lastStats = { level, xp, gold };
  res.sendStatus(204);
});

// --- 4) Endpoint Discord Interactions ---
app.post(
  '/interactions',
  // raw body dla weryfikacji podpisu
  express.raw({ type: 'application/json' }),
  // middleware weryfikujące X-Signature-Ed25519
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  (req, res) => {
    const bodyJson = req.body; // już obiekt JSON
    console.log('[Server] Interaction payload:', bodyJson);

    // Ping/Pong
    if (bodyJson.type === InteractionType.PING) {
      return res.send({ type: 1 });
    }

    // Slash-komenda /stats
    if (
      bodyJson.type === InteractionType.APPLICATION_COMMAND &&
      bodyJson.data.name === 'stats'
    ) {
      const { level, xp, gold } = lastStats;
      return res.send({
        type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
        data: {
          content: `Poziom: ${level}, XP: ${xp}, Złoto: ${gold}`
        }
      });
    }

    // Inne – 400 Bad Request
    return res.sendStatus(400);
  }
);

// --- 5) Start serwera ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`⚡ Listening on ${PORT}`));
