// deploy-commands.js
import 'dotenv/config';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

// Pobieramy zmienne środowiskowe
const { APP_ID, GUILD_ID, BOT_TOKEN } = process.env;

// Walidacja
if (!APP_ID || !GUILD_ID || !BOT_TOKEN) {
  console.error('❌ Brakuje jednej z wymaganych zmiennych: APP_ID, GUILD_ID, BOT_TOKEN');
  process.exit(1);
}

// Definicja komend
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

// Inicjalizacja klienta REST
const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

(async () => {
  try {
    console.log('🔄 Odświeżanie slash-komend...');

    // Rejestracja komend w konkretnym guildzie (do celów testowych)
    await rest.put(
      Routes.applicationGuildCommands(APP_ID, GUILD_ID),
      { body: commands }
    );

    console.log('✅ Slash-komendy zostały zarejestrowane!');
  } catch (error) {
    console.error('❌ Błąd rejestracji slash-komend:', error);
  }
})();
