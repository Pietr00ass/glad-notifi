// deploy-commands.js
import { REST, Routes } from 'discord.js';
import 'dotenv/config';

// Weź APP_ID, GUILD_ID i BOT_TOKEN z process.env
const { APP_ID, GUILD_ID, BOT_TOKEN } = process.env;

const commands = [
  {
    name: 'stats',
    description: 'Pobierz bieżące statystyki gracza'
  },
  {
    name: 'token',
    description: 'Wygeneruj swój API Token'
  }
];

const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

(async () => {
  try {
    console.log('🔄 Refreshing slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(APP_ID, GUILD_ID),
      { body: commands }
    );
    console.log('✅ Slash commands registered!');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
})();
