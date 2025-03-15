interface OpenRouterMessage {
  role: 'user' | 'assistant';
  content: string | {
    type: string;
    text?: string;
    image_url?: {
      url: string;
    };
  }[];
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface ProcessedSyllabusResponse {
  result: string;
  parsed: any;
}

// Updated to use backend API instead of direct OpenRouter calls
export async function callOpenRouter(messages: OpenRouterMessage[]): Promise<string> {
  try {
    const response = await fetch("http://localhost:5000/api/courses/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: messages[0].content
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`API error: ${errorData?.error || response.statusText}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error calling API:', error);
    throw error;
  }
}

export async function processSyllabus(content: string) {
  try {
    const response = await fetch("/api/courses/process-syllabus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data: ProcessedSyllabusResponse = await response.json();
    return data.parsed;
  } catch (error) {
    console.error('Error processing syllabus:', error);
    throw error;
  }
}