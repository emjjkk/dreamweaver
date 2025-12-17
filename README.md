### This bot no longer works because of changes to pricing plans on the API provider.
Maybe I'll upgrade to pro in the future but for now this bot is dead.

<img width="640" height="305" alt="image" src="https://github.com/user-attachments/assets/1c491660-4a6b-40c8-b78b-1130ea1bbdf1" />

### Getting Started

- Copy the contents of .env.example into an .env.local file and fill out your Supabase, Discord, and Huggingface credentials there.

- Dreamweaver at it's core is a NextJS + Supabase app and can be run as such

```
git clone https://github.com/emjjkk/Dreamweaver.git
npm install
npm run dev
```

- Interactions endpoint `/api/interactions`

- Commands `/lib/discord/commands`

- Register commands `/scripts/register-commands.ts` (run independently) 

- AI generation logic `/lib/generate/**`
