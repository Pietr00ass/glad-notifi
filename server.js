import express from 'express';
import { InteractionType, verifyKeyMiddleware } from 'discord-interactions';

const app = express();
app.use(express.json());

const PUBLIC_KEY = process.env.PUBLIC_KEY;

app.post('/interactions', verifyKeyMiddleware(PUBLIC_KEY), (req, res) => {
  const i = req.body;
  if (i.type === InteractionType.APPLICATION_COMMAND && i.data.name === 'stats') {
    const stats = { level: 2, xp: '6%', gold: 32 };
    return res.send({ type: 4, data: { content: `Poziom: ${stats.level}, XP: ${stats.xp}, Złoto: ${stats.gold}` } });
  }
  res.sendStatus(400);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`⚡ Listening on ${PORT}`));
