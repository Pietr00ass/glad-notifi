// deploy-commands.js
import 'dotenv/config';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

const { APP_ID, GUILD_ID, BOT_TOKEN } = process.env;
if (!APP_ID || !GUILD_ID || !BOT_TOKEN) {
  console.error('❌ Brakuje zmiennych: APP_ID, GUILD_ID lub BOT_TOKEN');
  process.exit(1);
}

const commands = [
  { name: 'stats',  description: 'Pobierz statystyki wszystkich Twoich kont' },
  { name: 'token',  description: 'Wygeneruj swój API Token' }
];

const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

(async () => {
  try {
    console.log('🔄 Odświeżanie slash-komend...');
    await rest.put(
      Routes.applicationGuildCommands(APP_ID, GUILD_ID),
      { body: commands }
    );
    console.log('✅ Slash-komendy zarejestrowane!');
  } catch (err) {
    console.error('❌ Błąd rejestracji komend:', err);
  }
})();
