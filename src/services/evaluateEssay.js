const API_URL =
  process.env.REACT_APP_EVALUATE_API_URL || '/.netlify/functions/evaluate-essay';

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (!contentType.includes('application/json')) {
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      throw new Error(
        'Could not reach the evaluation API. Make sure the local API server is running (use "npm start" or "npm run dev").'
      );
    }
    throw new Error(text || 'Unexpected response from the evaluation service.');
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON response from the evaluation service.');
  }
}

export async function evaluateEssay({ topic, essay }) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, essay }),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data.error || 'Failed to evaluate essay.');
  }

  return data;
}
