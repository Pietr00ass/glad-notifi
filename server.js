// server.js
import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import { InteractionType, verifyKeyMiddleware } from 'discord-interactions';
import 'dotenv/config';

const app = express();

// 1) Health‐check
app.get('/', (_req, res) => res.send('OK'));

// 2) CORS + preflight
app.use(cors());
app.options('*', cors());

// 3) JSON parser tylko na /updateStats
app.use('/updateStats', express.json());

// 4) Pamięć w RAM (userId → apiToken; userId → { accountName → stats })
const tokens   = {}; 
const allStats = {}; 

// 5) Handler Discord Interactions
app.post(
  '/interactions',
  express.raw({ type: 'application/json' }),
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  (req, res) => {
    const body = req.body;              // raw → już deserialized
    const userId = body.member.user.id; // Discord User ID

    console.log('[I] payload:', body);

    // PING → PONG
    if (body.type === InteractionType.PING) {
      return res.send({ type: 1 });
    }

    // /token → generujemy token i zapisujemy
    if (
      body.type === InteractionType.APPLICATION_COMMAND &&
      body.data.name === 'token'
    ) {
      const apiToken = crypto.randomUUID();
      tokens[userId] = apiToken;
      return res.send({
        type: 4,
        data: { content: `🔑 **Twój API Token:** \`${apiToken}\`` }
      });
    }

    // /stats → agregujemy i wysyłamy
    if (
      body.type === InteractionType.APPLICATION_COMMAND &&
      body.data.name === 'stats'
    ) {
      const statsMap = allStats[userId] || {};
      const lines = Object.entries(statsMap).map(
        ([acct, s]) => `• **${acct}** – Poziom: ${s.level}, XP: ${s.xp}, Złoto: ${s.gold}`
      );
      const reply = lines.length
        ? `📊 **Twoje konta:**\n${lines.join('\n')}`
        : '❗ Nie masz jeszcze żadnych kont. Użyj `/token` i skonfiguruj rozszerzenie.';
      return res.send({ type: 4, data: { content: reply } });
    }

    // wszystko inne: 400
    return res.sendStatus(400);
  }
);

// 6) updateStats – extension wyśle tu { token, account, level, xp, gold }
app.post('/updateStats', (req, res) => {
  console.log('[S] updateStats body:', req.body);
  const { token, account, level, xp, gold } = req.body;
  const userId = Object.entries(tokens).find(([, t]) => t === token)?.[0];

  if (!userId) {
    console.warn('[S] Invalid token:', token);
    return res.sendStatus(403);
  }

  allStats[userId] ||= {};
  allStats[userId][account] = { level, xp, gold };
  console.log(`[S] Updated ${userId}:${account}`, allStats[userId][account]);
  return res.sendStatus(204);
});

// 7) Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`⚡ Listening on ${PORT}`));
