import fetch from 'node-fetch';

/**
 * Process a request through OpenRouter API
 * @param {string} content - The content to process
 * @returns {Promise<object>} - The processed result
 */
export async function processOpenRouterRequest(content) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenRouter API key is not configured');
    }

    const prompt = `
      Analyze this course syllabus and create a detailed hierarchical course structure in VALID JSON format with:
      {
        "courseTitle": string,
        "courseDescription": string,
        "topics": Array<{
          "id": string,
          "title": string,
          "depth": number,
          "parentId": string | null,
          "notes": string,
          "keyConcepts": string[],
          "assessments": string[],
          "activities": string[],
          "caseStudies": string[],
          "methodology": string,
          "resources": string[],
          "prerequisites": string[],
          "duration": number,
          "difficulty": number
        }>
      }

      Follow STRICTLY:
      1. Use double quotes ONLY
      2. No trailing commas
      3. No markdown formatting
      4. Escape special characters
      5. Maintain proper array formatting
      6. Recursively generate subtopics for each topic:
         - For each main topic (depth:1), create 3-5 subtopics (depth:2)
         - For each depth:2 subtopic, create 2-3 child topics (depth:3)
         - Continue breaking down until all concepts are covered (max depth:5)
         - Each child topic must reference its parent via parentId
      7. Ensure hierarchical relationships:
         - Parent topics should contain broader concepts
         - Child topics must be specific components of their parent
         - Sibling topics should represent parallel concepts

      Syllabus content:
      ${content}
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.APP_URL || 'http://localhost:5000',
        "X-Title": "AI Lecture Planner",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-pro-exp-02-05:free",
        "messages": [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const rawContent = data.choices[0].message.content;
    // Enhanced JSON sanitization
let sanitizedContent = rawContent
  .replace(/```(json)?/g, '')
  .replace(/([^\\])'(?=\s*:)/g, '$1"')
  .replace(/,\s*([}\]])/g, '$1')
  .replace(/([{,])\s*([}\]]|\b)/g, '$1$2')
  .replace(/\bNaN\b/g, 'null')
  .trim();

// Parse with validation and retries
let parsed = null;
for (let attempt = 0; attempt < 3; attempt++) {
  try {
    parsed = JSON.parse(sanitizedContent);
    
    // Structural validation
    if (!parsed.courseTitle || !parsed.topics) {
      throw new Error('Missing required fields');
    }
    
    const rootTopics = parsed.topics.filter(t => t.depth === 1);
    if (rootTopics.length < 1) {
      throw new Error('No root topics found');
    }
    
    break;
  } catch (parseError) {
    if (attempt === 2) {
      console.error('JSON parsing failed after 3 attempts:', {
        error: parseError.message,
        position: parseError.position,
        snippet: sanitizedContent.slice(Math.max(0, parseError.position - 50), parseError.position + 50),
        rawContent: rawContent.slice(0, 500)
      });
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }
    
    // Attempt basic corrections
    sanitizedContent = sanitizedContent
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']');
  }
}

return {
  result: rawContent,
  parsed
};
  } catch (error) {
    console.error('Error in OpenRouter service:', error);
    throw error;
  }
}