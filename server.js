// server.js
import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import { InteractionType, verifyKeyMiddleware } from 'discord-interactions';
import 'dotenv/config';

const app = express();

// 1) Health-check
app.get('/', (req, res) => res.send('OK'));

// 2) CORS + preflight
app.use(cors());
app.options('*', cors());

// 3) Parsowanie JSON tylko dla updateStats
app.use('/updateStats', express.json());

// —————————————————————————————————————————————
// 4) Pamięć w RAM (w produkcji: baza danych)
const tokens   = {};   // { discordUserId: apiToken }
const allStats = {};   // { discordUserId: { accountName: { level, xp, gold } } }

// —————————————————————————————————————————————
// 5) Slash-komendy: /interactions
app.post(
  '/interactions',
  express.raw({ type: 'application/json' }),
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  (req, res) => {
    const body = JSON.parse(req.body.toString());
    const userId = body.member.user.id;

    // a) Pong
    if (body.type === InteractionType.PING) {
      return res.send({ type: 1 });
    }

    // b) /token — generujemy lub odświeżamy token
    if (body.type === InteractionType.APPLICATION_COMMAND && body.data.name === 'token') {
      const apiToken = crypto.randomUUID();
      tokens[userId] = apiToken;
      return res.send({
        type: 4,
        data: {
          content: `🔑 **Twój API Token:** \`${apiToken}\`\nWklej go w rozszerzeniu, podaj też nazwę konta.`
        }
      });
    }

    // c) /stats — wypisujemy wszystkie konta zebrane pod tym tokenem
    if (body.type === InteractionType.APPLICATION_COMMAND && body.data.name === 'stats') {
      const statsMap = allStats[userId] || {};
      const lines = Object.entries(statsMap).map(
        ([acct, s]) => `• **${acct}** – Poziom: ${s.level}, XP: ${s.xp}, Złoto: ${s.gold}`
      );
      const reply = lines.length
        ? `📊 **Twoje konta:**\n${lines.join('\n')}`
        : '❗ Nie masz jeszcze żadnych kont. Użyj `/token`, skonfiguruj rozszerzenie i odśwież grę.';
      return res.send({ type: 4, data: { content: reply } });
    }

    // nieobsługiwane
    return res.sendStatus(400);
  }
);

// —————————————————————————————————————————————
// 6) Endpoint do aktualizacji statystyk z rozszerzenia
app.post('/updateStats', (req, res) => {
  const { token, account, level, xp, gold } = req.body;

  // znajdź usera po tokenie
  const userId = Object.entries(tokens).find(([, t]) => t === token)?.[0];
  if (!userId) {
    console.warn('[Server] Invalid token:', token);
    return res.sendStatus(403);
  }

  // zainicjalizuj mapę jeśli potrzeba
  allStats[userId] ||= {};
  allStats[userId][account] = { level, xp, gold };
  console.log(`[Server] Updated stats for ${userId}:${account}`, allStats[userId][account]);

  return res.sendStatus(204);
});

// —————————————————————————————————————————————
// 7) Start serwera
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`⚡ Listening on ${PORT}`));
