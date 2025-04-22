import express from 'express';
import { InteractionType, verifyKeyMiddleware } from 'discord-interactions';

const app = express();

// Inne trasy mogą korzystać z JSON parsera, np.:
// app.use(express.json());

//
// Dla /interactions używamy raw body + weryfikacja
//
app.post(
  '/interactions',
  // 1) najpierw parsujemy raw body (zwróć uwagę na type)
  express.raw({ type: 'application/json' }),
  // 2) potem weryfikujemy podpis Discorda
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  // 3) i dopiero teraz odczytujemy JSON z bufora
  (req, res) => {
    const body = JSON.parse(req.body.toString());
    if (body.type === InteractionType.PING) {
      return res.send({ type: 1 }); // Pong
    }
    if (body.type === InteractionType.APPLICATION_COMMAND && body.data.name === 'stats') {
      const stats = { level: 2, xp: '6%', gold: 32 };
      return res.send({
        type: 4,
        data: {
          content: `Poziom: ${stats.level}, XP: ${stats.xp}, Złoto: ${stats.gold}`
        }
      });
    }
    res.sendStatus(400);
  }
);

// Jeżeli chcesz mieć inne trasy, to pod nie możesz już użyć raw parsera
// app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`⚡ Listening on ${PORT}`));
