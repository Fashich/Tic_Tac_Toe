# Core Features

## Multiplayer Game Modes

1. AI Opponents : 4 difficulty levels (Easy, Medium, Hard, Expert)
2. Local Play : Hotseat mode for shared-device gameplay
3. Online Play :
a. Private rooms with 6-character access codes
b. Public matchmaking system
c. Real-time multiplayer
d. Mobile-Optimized : Fully responsive design with touch-friendly controls

## Player Experience

1. Persistent Game State : Save/load functionality with full move history
2. Interactive Tutorial : Guided learning system with hands-on practice
3. Statistics Dashboard : Track wins/losses, analyze game history, and monitor progress

## Technical Architecture

1. Framework : Next.js with App Router and Server Components
2. Styling : Tailwind CSS v4 with optimized utility classes
3. Real-Time Communication for live gameplay synchronization
4. AI Engine : Minimax algorithm with alpha-beta pruning optimization
5. Font Optimization : Self-hosted Geist typeface via next/font
6. State Management : React Context API with Zustand integration

## This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app)

## Getting Started

First, run installation Module Dependencies:

```bash
npm install lucide-react class-variance-authority @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-select clsx tailwind-merge sonner next-themes
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
