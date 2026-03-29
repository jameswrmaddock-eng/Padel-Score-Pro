# Padel Score Tracker

A mobile-friendly padel match scorer with support for Long Deuce, Silver Point, and Golden Point rules.

## Features

- 🎾 Full padel scoring — 0 / 15 / 30 / 40 / Deuce / Advantage
- ⚡ Tiebreak support (auto-triggered at 6–6)
- 🥇 Three deuce modes: Long Deuce, Silver Point, Golden Point
- 📋 Live match log
- ↩️ Undo last point
- 🏆 Winner screen with final scoreline
- 📱 Works as a home screen app on iPhone and Android

## Deploy to Vercel

### Option A — Drag & Drop (easiest)
1. Go to [vercel.com](https://vercel.com) and sign up / log in
2. From your dashboard click **Add New → Project**
3. Choose **"Upload"** and drag this entire folder in
4. Click **Deploy** — done in under a minute

### Option B — Vercel CLI
```bash
npm install -g vercel
cd padel-score-tracker
vercel
```
Follow the prompts. Your app will be live at a `yourname.vercel.app` URL.

### Option C — GitHub
1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **Add New → Project**
3. Import your GitHub repo
4. Vercel auto-detects the static site — click **Deploy**

## Add to Phone Home Screen (after deploying)

**iPhone:** Open your Vercel URL in Safari → Share → Add to Home Screen  
**Android:** Open in Chrome → Menu → Add to Home Screen
