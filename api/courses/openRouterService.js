// OpenRouter API service for Edge runtime

const OPENROUTER_API_URL = 'https://api.openrouter.ai/api/v1/chat/completions';

export async function processOpenRouterRequest(prompt, apiKey) {
  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'HTTP-Referer': process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000',
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
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error?.message || 
      `OpenRouter API request failed with status ${response.status}`
    );
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    model: data.model,
    usage: data.usage
  };
}