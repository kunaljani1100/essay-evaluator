const GRE_SCORING_RUBRIC = `
You are an expert GRE Analytical Writing evaluator. Score essays using the official ETS scoring criteria:
https://www.ets.org/gre/test-takers/general-test/prepare/content/analytical-writing/scoring.html

SCORE RANGE: 0 to 6 in half-point increments (e.g., 4, 4.5, 5).

SCORE LEVEL DESCRIPTIONS (overall quality):

Scores 6 and 5.5:
Sustains insightful, in-depth analysis of complex ideas; develops and supports main points with logically compelling reasons and/or highly persuasive examples; is well focused and well organized; skillfully uses sentence variety and precise vocabulary to convey meaning effectively; demonstrates superior facility with sentence structure and usage, but may have minor errors that do not interfere with meaning.

Scores 5 and 4.5:
Provides generally thoughtful analysis of complex ideas; develops and supports main points with logically sound reasons and/or well-chosen examples; is generally focused and well organized; uses sentence variety and vocabulary to convey meaning clearly; demonstrates good control of sentence structure and usage, but may have minor errors that do not interfere with meaning.

Scores 4 and 3.5:
Provides competent analysis of ideas in addressing specific task directions; develops and supports main points with relevant reasons and/or examples; is adequately organized; conveys meaning with acceptable clarity; demonstrates satisfactory control of sentence structure and usage, but may have some errors that affect clarity.

Scores 3 and 2.5:
Displays some competence in analytical writing and addressing specific task directions, although the writing is flawed in at least one of the following ways: limited analysis or development; weak organization; weak control of sentence structure or usage, with errors that often result in vagueness or a lack of clarity.

Scores 2 and 1.5:
Displays serious weaknesses in analytical writing. The writing is seriously flawed in at least one of the following ways: serious lack of analysis or development; unclear in addressing specific task directions; lack of organization; frequent problems in sentence structure or usage, with errors that obscure meaning.

Scores 1 and 0.5:
Displays fundamental deficiencies in analytical writing. The writing is fundamentally flawed in at least one of the following ways: content that is extremely confusing or mostly irrelevant to the assigned tasks; little or no development; severe and pervasive errors that result in incoherence.

Score 0:
Off topic, foreign language, merely copies the topic, illegible, or nonverbal.

ANALYZE AN ISSUE TASK SCORING GUIDE:

Score 6 Outstanding:
- Articulates a clear and insightful position on the issue
- Develops the position fully with compelling reasons and/or persuasive examples
- Sustains a well-focused, well-organized analysis, connecting ideas logically
- Conveys ideas fluently and precisely, using effective vocabulary and sentence variety
- Demonstrates superior facility with standard written English (minor errors allowed)

Score 5 Strong:
- Presents a clear and well-considered position on the issue
- Develops the position with logically sound reasons and/or well-chosen examples
- Is focused and generally well organized, connecting ideas appropriately
- Conveys ideas clearly and well, using appropriate vocabulary and sentence variety
- Demonstrates facility with standard written English (minor errors allowed)

Score 4 Adequate:
- Presents a clear position on the issue
- Develops the position with relevant reasons and/or examples
- Is adequately focused and organized
- Demonstrates sufficient control of language to express ideas with acceptable clarity
- Generally demonstrates control of standard written English (some errors allowed)

Score 3 Limited (one or more flaws):
- Vague or limited in addressing task directions and/or developing position
- Weak use of relevant reasons or examples, or relies largely on unsupported claims
- Limited focus and/or organization
- Language/sentence structure problems that reduce clarity
- Occasional major or frequent minor grammar errors that can interfere with meaning

Score 2 Seriously Flawed (one or more serious flaws):
- Unclear or seriously limited in addressing task directions and/or developing position
- Few, if any, relevant reasons or examples
- Poorly focused and/or poorly organized
- Serious language problems that frequently interfere with meaning
- Serious grammar errors that frequently obscure meaning

Score 1 Fundamentally Deficient:
- Little or no evidence of understanding the issue
- Little or no evidence of organized response
- Severe language problems that persistently interfere with meaning
- Pervasive grammar errors resulting in incoherence

EVALUATION INSTRUCTIONS:
1. Treat the provided topic as an "Analyze an Issue" GRE prompt.
2. Evaluate how well the essay addresses the specific topic and task directions.
3. Assign a score from 0 to 6 in half-point increments only.
4. Be rigorous but fair, matching ETS score level descriptions.
5. Provide constructive, actionable feedback.
6. Respond with valid JSON only — no markdown fences or extra text.
`;

const RESPONSE_SCHEMA = `{
  "score": <number 0-6 in 0.5 increments>,
  "scoreLabel": "<Outstanding|Strong|Adequate|Limited|Seriously Flawed|Fundamentally Deficient|Off Topic>",
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "areasForImprovement": ["<area 1>", "<area 2>", "<area 3>"],
  "criteria": {
    "position": "<assessment of clarity and insight of position>",
    "development": "<assessment of reasons, examples, and support>",
    "organization": "<assessment of focus, structure, and logical flow>",
    "language": "<assessment of vocabulary, sentence variety, and clarity>",
    "mechanics": "<assessment of grammar, usage, and mechanics>"
  }
}`;

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

function parseEvaluationResponse(text) {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Claude did not return valid JSON.');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  if (typeof parsed.score !== 'number' || parsed.score < 0 || parsed.score > 6) {
    throw new Error('Invalid score in evaluation response.');
  }

  if (parsed.score % 0.5 !== 0) {
    parsed.score = Math.round(parsed.score * 2) / 2;
  }

  return parsed;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' }),
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Server configuration error: ANTHROPIC_API_KEY is not set.',
      }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid JSON in request body.' }),
    };
  }

  const { topic, essay } = body;

  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Essay topic is required.' }),
    };
  }

  if (!essay || typeof essay !== 'string' || !essay.trim()) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Essay content is required.' }),
    };
  }

  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

  const userMessage = `Evaluate the following GRE "Analyze an Issue" essay.

ESSAY TOPIC:
${topic.trim()}

STUDENT ESSAY:
${essay.trim()}

Return your evaluation as JSON matching this schema:
${RESPONSE_SCHEMA}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        system: GRE_SCORING_RUBRIC,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Anthropic API error:', response.status, errorBody);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: 'Failed to evaluate essay. Please try again later.',
        }),
      };
    }

    const data = await response.json();
    const textBlock = data.content?.find((block) => block.type === 'text');

    if (!textBlock?.text) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Empty response from evaluation service.' }),
      };
    }

    const evaluation = parseEvaluationResponse(textBlock.text);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(evaluation),
    };
  } catch (error) {
    console.error('Evaluation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || 'An unexpected error occurred during evaluation.',
      }),
    };
  }
};
