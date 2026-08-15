# SmartCart

AI-powered grocery planning that starts with your store's deals.

---

## Deploy in ~10 minutes (free)

### What you need
- A [GitHub](https://github.com) account (free)
- A [Netlify](https://netlify.com) account (free)
- An [Anthropic API key](https://console.anthropic.com) (~$5 credit covers extensive user testing)

---

### Step 1 — Put the code on GitHub

**Option A: GitHub web UI (no terminal needed)**
1. Go to [github.com/new](https://github.com/new)
2. Name the repo `smartcart`, set it to **Private**, click **Create repository**
3. On the next screen click **uploading an existing file**
4. Drag and drop the entire `smartcart/` folder contents
5. Click **Commit changes**

**Option B: Terminal**
```bash
cd smartcart
git init
git add .
git commit -m "SmartCart initial"
gh repo create smartcart --private --push --source=.
```

---

### Step 2 — Deploy to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**
2. Choose **GitHub** → authorize → select your `smartcart` repo
3. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Click **Deploy site**

Netlify gives you a URL like `https://smartcart-abc123.netlify.app` in about 60 seconds.

---

### Step 3 — Add your Anthropic API key

This is what makes AI Chef and recipe generation work.

1. In Netlify: **Site → Site configuration → Environment variables**
2. Click **Add a variable**:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your key from [console.anthropic.com/keys](https://console.anthropic.com/keys)
3. Click **Save** → then **Deploys → Trigger deploy → Deploy site**

That's it. Your API key lives on the server — users never see it.

---

### Step 4 — Share with testers

Send them your Netlify URL. Works on any phone browser. No app install needed.

**For a custom domain** (optional, ~$12/year):
- Netlify → **Domain management → Add custom domain**

---

## What works in the deployed app

| Feature | Status |
|---------|--------|
| AI Chef (Claude AI) | ✅ Via serverless proxy |
| AI recipe generation | ✅ Via serverless proxy |
| GPS store finder | ✅ Native browser geolocation |
| Address geocoding | ✅ Nominatim (no key needed) |
| Pantry persistence | ✅ localStorage |
| Preferences persistence | ✅ localStorage |
| All meal planning UI | ✅ Fully local |
| Grocery checklist | ✅ Fully local |
| Push notifications | ⚠️ Scheduled for v2 (requires service worker) |

---

## Local development

```bash
npm install
npm install -g netlify-cli   # one-time
netlify dev                  # runs app + functions together on localhost:8888
```

Create a `.env` file for local dev:
```
ANTHROPIC_API_KEY=sk-ant-...
```

> **Never commit `.env`** — it's in `.gitignore` already.

---

## Architecture

```
Browser (React + Vite)
  │
  ├── UI, state, localStorage  ──── all client-side
  │
  ├── GPS / Nominatim geocoding ─── direct from browser (no key needed)
  │
  └── AI calls ──────────────────── POST /.netlify/functions/claude
                                         │
                                         └── Netlify Function (Node.js)
                                               │
                                               └── api.anthropic.com
                                                   (key stays server-side)
```

---

## Feedback from testers

Useful things to ask:
- Did the store finder work? Did your store show up?
- Were the meal plan options relevant to how you actually eat?
- Did the AI Chef give useful answers?
- What would you want that's missing?

---

## Cost estimate for user testing

Anthropic API pricing (claude-sonnet-4-6):
- ~$3 per 1,000 AI Chef conversations
- Recipe generation: ~$0.002 per recipe

100 active beta testers using AI Chef 5x/week = ~$6-15/month.

Netlify free tier covers 100GB bandwidth and 125k function invocations/month — more than enough for beta testing.
