require('dotenv').config();

const express = require('express');
const { handler } = require('../netlify/functions/evaluate-essay');

const PORT = process.env.API_PORT || 3001;
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'essay-evaluator-api',
    hasApiKey: Boolean(process.env.ANTHROPIC_API_KEY),
  });
});

async function invokeHandler(req, res) {
  try {
    const result = await handler({
      httpMethod: req.method,
      body: req.method === 'POST' ? JSON.stringify(req.body) : null,
      headers: req.headers,
    });

    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
    }

    res.status(result.statusCode).send(result.body);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

app.options('/.netlify/functions/evaluate-essay', invokeHandler);
app.post('/.netlify/functions/evaluate-essay', invokeHandler);

const server = app.listen(PORT, () => {
  console.log(`Local API server running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('Warning: ANTHROPIC_API_KEY is not set in .env — evaluations will fail.');
  }
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use.`);
    console.error('Another API server may still be running from a previous session.');
    console.error('Fix: run "npm run stop" then "npm start" again.\n');
  } else {
    console.error('Failed to start API server:', error.message);
  }
  process.exit(1);
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
