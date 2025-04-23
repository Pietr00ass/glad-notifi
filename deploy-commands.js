// deploy-commands.js
import 'dotenv/config';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

const BOT_TOKEN   = process.env.BOT_TOKEN;
const CLIENT_ID   = process.env.CLIENT_ID;
const GUILD_ID    = process.env.GUILD_ID;  // do testów możesz zostawić, dla globalnych komend pomiń

if (!BOT_TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error('❌ Missing one of required env vars: BOT_TOKEN, CLIENT_ID, GUILD_ID');
  process.exit(1);
}

const commands = [
  { name: 'stats', description: 'Pobierz statystyki wszystkich Twoich kont' },
  { name: 'token', description: 'Wygeneruj swój API Token' }
];

const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

(async () => {
  try {
    console.log('🔄 Refreshing slash commands...');

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log('✅ Slash commands registered!');
  } catch (error) {
    console.error('❌ Error registering slash commands:', error);
  }
})();
