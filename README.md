# SayIt 🗣️

> Plan difficult conversations with confidence.

SayIt helps you prepare for hard conversations — with your manager, partner, or anyone else. Answer 4 simple questions and get a personalized, AI-generated conversation blueprint in seconds.

**Private. No login. No data stored.**

---

## 🚀 Deploy to Vercel (recommended)

The easiest way to host SayIt directly from GitHub — free, automatic deploys on every push.

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sayit.git
git push -u origin main
```

### Step 2 — Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `sayit` repository
4. Click **Deploy** (Vercel auto-detects React)

### Step 3 — Add your API key
1. In Vercel, go to your project → **Settings → Environment Variables**
2. Add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your key from [console.anthropic.com](https://console.anthropic.com)
3. Click **Save** → **Redeploy**

✅ Your app is live at `https://sayit.vercel.app` (or similar).

---

## 💻 Run Locally

```bash
git clone https://github.com/YOUR_USERNAME/sayit.git
cd sayit
npm install
cp .env.example .env       # add your API key inside
npm start                  # opens at http://localhost:3000
```

---

## 📁 Project Structure

```
sayit/
├── api/
│   └── chat.js            # Serverless proxy — keeps API key secret
├── public/
│   └── index.html
├── src/
│   ├── index.js
│   └── App.jsx
├── .env.example
├── .gitignore
├── vercel.json
├── package.json
└── README.md
```

---

## 🔐 Security

Your API key lives only in Vercel's environment variables — never in the browser. All AI calls go through `/api/chat`.

---

## Tech Stack

- React 18
- Vercel (hosting + serverless functions)
- Anthropic Claude API

---

## License

MIT
