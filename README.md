# Gladiatus Discord Bot

Backend Node.js obsługujący Slash‑Command `/stats` dla Discorda.

## Deploy na Railway

1. Stwórz projekt w Railway i połącz z GitHubem.
2. Ustaw zmienną środowiskową `PUBLIC_KEY` w panelu zmiennych.
3. W Discord Developer Portal wklej:
   `https://<twoj-projekt>.up.railway.app/interactions` jako Interactions Endpoint URL.

## Uwaga
Jeśli podczas deploya pojawiają się błędy `ETARGET`, zaktualizuj w `package.json` wersję `discord-interactions` zgodnie z dostępną na npm.
