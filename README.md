# GRE Essay Evaluator

A React application that evaluates GRE Analytical Writing essays using Claude AI and the [official ETS scoring rubric](https://www.ets.org/gre/test-takers/general-test/prepare/content/analytical-writing/scoring.html).

Students submit an essay topic and their written response. The app returns a score from **0 to 6** (in half-point increments) along with detailed feedback on position, development, organization, language, and mechanics.

## Features

- **Two inputs**: essay topic (Analyze an Issue prompt) and essay content
- **AI evaluation**: powered by Claude via a secure Netlify serverless function
- **Official rubric**: scoring aligned with ETS GRE Analytical Writing criteria
- **Detailed feedback**: score label, summary, strengths, improvements, and per-criterion analysis
- **Netlify-ready**: deploy globally with one click

## Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

## Local Development

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy the example env file and add your API key:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:

   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

3. **Run the app**

   ```bash
   npm start
   ```

   This starts:
   - **API server** on port **3001** (evaluation endpoint)
   - **React app** on port **3000** (UI) — waits until the API is healthy

   Open [http://localhost:3000](http://localhost:3000).

   You should see output like:

   ```
   [api] Local API server running at http://localhost:3001
   [web] Compiled successfully!
   ```

   **Alternative — Netlify Dev (mirrors production)**

   ```bash
   npm run dev
   ```

   Open [http://localhost:8888](http://localhost:8888).

## Troubleshooting local startup

### Port already in use

If you see `Port 3001 is already in use`, a previous dev server is still running:

```bash
npm run stop
npm start
```

### API not reachable / HTML instead of JSON

Make sure **both** servers are running. Do not use `npm run start:web` alone — that starts React without the API.

Verify the API is up:

```bash
curl http://localhost:3001/health
```

Expected response: `{"status":"ok","service":"essay-evaluator-api","hasApiKey":true}`

### Missing API key

Ensure `.env` exists and contains:

```
ANTHROPIC_API_KEY=your_key_here
```

Restart after changing `.env`.

## Deploy to Netlify

### Option A: Deploy from Git (recommended)

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Log in to [Netlify](https://www.netlify.com/) and click **Add new site → Import an existing project**.
3. Connect your repository. Netlify will detect the settings from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
   - **Functions directory:** `netlify/functions`
4. Add an environment variable in **Site settings → Environment variables**:
   - `ANTHROPIC_API_KEY` = your Anthropic API key
5. Deploy. Your site will be live at a `*.netlify.app` URL.

### Option B: Deploy from CLI

```bash
npm install
npm run build
npx netlify deploy --prod
```

Set `ANTHROPIC_API_KEY` in the Netlify dashboard before testing evaluation in production.

## Project Structure

```
essay-evaluator/
├── netlify/
│   └── functions/
│       └── evaluate-essay.js   # Serverless function — calls Claude API
├── netlify.toml                # Netlify build & redirect config
├── src/
│   ├── App.js                  # Main UI
│   ├── components/
│   │   └── EvaluationResult.js # Score & feedback display
│   └── services/
│       └── evaluateEssay.js    # API client
└── public/
```

## How Scoring Works

The serverless function sends the essay and topic to Claude with a system prompt containing the full ETS Analytical Writing scoring guide, including:

- Overall score level descriptions (6 down to 0)
- Analyze an Issue task criteria for each score band
- Instructions to return structured JSON with score, feedback, and criterion-level analysis

Scores follow the official scale: **0 to 6 in half-point increments** (e.g., 4, 4.5, 5).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key (server-side only) |
| `ANTHROPIC_MODEL` | No | Claude model override (default: `claude-sonnet-4-20250514`) |
| `REACT_APP_EVALUATE_API_URL` | No | API endpoint override for the React app |

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start API + React (recommended) |
| `npm run stop` | Stop stale dev servers on ports 3000/3001 |
| `npm run dev` | Start with Netlify Dev (production-like) |
| `npm run start:web` | Start React only (API unavailable) |
| `npm run start:api` | Start local API server only |
| `npm run build` | Production build |
| `npm test` | Run tests |

## License

MIT
