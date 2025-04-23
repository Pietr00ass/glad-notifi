// deploy-commands.js
import 'dotenv/config';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

const commands = [
  {
    name: 'stats',
    description: 'Pobierz statystyki wszystkich Twoich kont'
  },
  {
    name: 'token',
    description: 'Wygeneruj swój API Token'
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log('🔄 Refreshing slash commands...');

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,    // Twój Application (Client) ID
        process.env.GUILD_ID      // ID testowego serwera (lub usuwasz _Guild_ żeby globalne)
      ),
      { body: commands }
    );

    console.log('✅ Slash commands registered!');
  } catch (error) {
    console.error('❌ Error registering slash commands:', error);
  }
})();
