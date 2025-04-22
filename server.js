// server.js
import express from 'express';
import { InteractionType, verifyKeyMiddleware } from 'discord-interactions';

const app = express();

// **PAMIĘĆ STATYSTYK** (bez zmian)
let lastStats = { level: '', xp: '', gold: '' };

// **1. Endpoint do aktualizacji statystyk z rozszerzenia**  
//    - tutaj używamy express.json(), bo to normalny JSON
app.post('/updateStats', express.json(), (req, res) => {
  const { level, xp, gold } = req.body;
  console.log('[Server] Received stats:', req.body);
  lastStats = { level, xp, gold };
  res.sendStatus(204);
});

// **2. Endpoint Interactions**  
//    - całkowicie bez globalnego JSON parsera!
//    - express.raw() przechwytuje surowe body  
app.post(
  '/interactions',
  express.raw({ type: 'application/json' }),
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  (req, res) => {
    let bodyJson;
    try {
      // Z buforka zamieniamy na string i parsujemy
      bodyJson = JSON.parse(req.body.toString('utf8'));
    } catch (err) {
      console.error('[Server] Invalid JSON:', err);
      return res.sendStatus(400);
    }

    // Ping / Pong
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

    // Nieobsługiwane
    res.sendStatus(400);
  }
);

// **UWAGA**: ŻADNE app.use(express.json()) ani inny parser w global scope!
// Jeśli masz, to go **usuń** lub zakomentuj.

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`⚡ Listening on ${PORT}`));
