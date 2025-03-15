// OpenRouter API service for Edge runtime

const OPENROUTER_API_URL = 'https://api.openrouter.ai/api/v1/chat/completions';

export async function processOpenRouterRequest(prompt) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is not configured');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:3000',
    'X-Title': 'AI Lecture Planner'
  };

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'anthropic/claude-3-opus-20240229',
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