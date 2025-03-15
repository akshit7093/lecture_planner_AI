// OpenRouter API service for Edge runtime

const OPENROUTER_API_URL = 'https://api.openrouter.ai/api/v1/chat/completions';

export async function processOpenRouterRequest(prompt, apiKey) {
  if (!apiKey) {
    console.error('OpenRouter API key check:', {
      envKeys: Object.keys(process.env),
      vercelEnv: process.env.VERCEL
    });
    throw new Error('OpenRouter API key is not configured');
  }

  // Validate and use Vercel-specific environment variables
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'HTTP-Referer': process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000',
    'X-Title': 'AI Lecture Planner'
  };

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'google/gemini-2.0-pro-exp-02-05:free',
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenRouter API Failure:', {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      errorText: errorText.slice(0, 500),
      apiKeyConfigured: !!apiKey
    });
    throw new Error(`OpenRouter API error ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    model: data.model,
    usage: data.usage
  };
}