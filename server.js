// server.js
import express from 'express';
import cors from 'cors';
import { InteractionType, verifyKeyMiddleware } from 'discord-interactions';
import 'dotenv/config';

const app = express();

// --- 1) Health-check dla Railway i debugu ---
app.get('/', (req, res) => res.send('OK'));

// --- 2) Globalne CORS + preflight dla wszystkich tras ---
app.use(cors());
app.options('*', cors());  // obsługuje każdy preflight

// --- 3) Parsowanie JSON tylko tam, gdzie trzeba ---
app.use('/updateStats', express.json());

// --- 4) Pamięć na ostatnie statystyki ---
let lastStats = { level: '', xp: '', gold: '' };

// --- 5) Endpoint do aktualizacji statystyk ---
app.post('/updateStats', (req, res) => {
  console.log('[Server] Received stats:', req.body);
  lastStats = req.body;
  res.sendStatus(204);
});

// --- 6) Endpoint Discord Interactions ---
app.post(
  '/interactions',
  express.raw({ type: 'application/json' }),
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  (req, res) => {
    const body = req.body;
    console.log('[Server] Interaction payload:', body);

    if (body.type === InteractionType.PING) {
      return res.send({ type: 1 });
    }
    if (
      body.type === InteractionType.APPLICATION_COMMAND &&
      body.data.name === 'stats'
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

// --- 7) Start serwera ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`⚡ Listening on ${PORT}`));
