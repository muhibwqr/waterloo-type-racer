# WaterlooType

Competitive typing for University of Waterloo students. Race through Waterloo-themed prompts, track your stats, and climb the leaderboard.

## Getting Started

```bash
git clone https://github.com/muhibwqr/waterloo-type-racer.git
cd waterloo-type-racer
npm install
npm run dev
```

The development server runs on port `8080` by default. Update the Supabase environment variables if you need to point to a different backend.

## Tech Stack

- Vite + React (TypeScript)
- Tailwind CSS + shadcn/ui
- Supabase (auth + database)
- React Router

## Deployment

Build the production bundle with:

```bash
npm run build
```

Serve the generated `dist/` directory using your preferred hosting platform (Netlify, Vercel, Cloudflare Pages, etc.).
