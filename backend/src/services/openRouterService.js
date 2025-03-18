import fetch from 'node-fetch';
import dns from 'dns';
import { promisify } from 'util';

const dnsResolve = promisify(dns.resolve);
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function checkDNSConnectivity(hostname) {
  try {
    await dnsResolve(hostname);
    return true;
  } catch (error) {
    console.error(`DNS resolution failed for ${hostname}:`, error);
    return false;
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Process a request through OpenRouter API with retry logic
 * @param {string} content - The content to process
 * @param {string} userRole - The user role (teacher or student)
 * @returns {Promise<object>} - The processed result
 */
export async function processOpenRouterRequest(content, userRole = 'teacher') {
  let lastError = null;
  let retryCount = 0;

  while (retryCount < MAX_RETRIES) {
    try {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error('OpenRouter API key is not configured');
      }

      const canResolve = await checkDNSConnectivity('openrouter.ai');
      if (!canResolve) {
        console.log(`DNS resolution attempt ${retryCount + 1} failed, retrying in ${RETRY_DELAY}ms...`);
        await delay(RETRY_DELAY);
        retryCount++;
        continue;
      }

      const basePrompt = `
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
            "difficulty": number,
            "relatedTopics": string[]
          }>
        }
      `;

      const teacherPrompt = `
        ${basePrompt}
        Follow STRICTLY:
        1. Use double quotes ONLY
        2. No trailing commas
        3. No markdown formatting
        4. Escape special characters
        5. Maintain proper array formatting
        6. Prioritize depth over breadth in topic hierarchy:
           - Start with 2-3 core main topics (depth:1)
           - For each main topic, create 2-3 focused subtopics (depth:2)
           - For each depth:2 subtopic, create 3-4 detailed child topics (depth:3)
           - For each depth:3 topic, create 2-3 specific implementation topics (depth:4)
           - Continue to depth:5 for highly specialized concepts
           - Each child topic must reference its parent via parentId
        7. Ensure rich interconnections:
           - Add relatedTopics array with IDs of connected topics at the same depth
           - Connect topics based on shared concepts, dependencies, or complementary learning objectives
           - Identify and link prerequisite relationships between parallel topics
        8. Maintain semantic hierarchy:
           - Parent topics should represent foundational concepts
           - Child topics should demonstrate progressive complexity
           - Sibling topics should show clear conceptual relationships

        Syllabus content:
        ${content}
      `;

      const studentPrompt = `
        ${basePrompt}
        Follow STRICTLY:
        1. Use double quotes ONLY
        2. No trailing commas
        3. No markdown formatting
        4. Escape special characters
        5. Maintain proper array formatting
        6. Focus on student-friendly learning path:
           - Break down complex topics into manageable chunks
           - Provide clear learning objectives for each topic
           - Include practical examples and real-world applications
           - Add detailed explanations in notes field
           - Suggest supplementary learning materials in resources
        7. Enhance learning support:
           - Add comprehensive study guides in notes
           - Include practice problems in activities
           - Provide self-assessment questions in assessments
           - Link to video tutorials and interactive content in resources
           - Add step-by-step learning paths in methodology
        8. Create rich learning context:
           - Connect topics to real-world applications
           - Include beginner-friendly explanations
           - Provide multiple learning approaches
           - Suggest additional reading materials
           - Include interactive exercises and practice problems

        Syllabus content:
        ${content}
      `;

      const prompt = userRole === 'student' ? studentPrompt : teacherPrompt;

      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.VERCEL_URL || process.env.APP_URL || 'http://localhost:5000',
          'X-Title': 'AI Lecture Planner',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'model': 'google/gemini-2.0-pro-exp-02-05:free',
          'messages': [
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

      let sanitizedContent = rawContent
        .replace(/```(?:json)?|```/g, '')
        .replace(/\[^"]/g, '\\$&')
        .replace(/(?<!\\)"(?=.*:)/g, '\"')
        .replace(/[\t\n\r]/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/,\s*([}\]])/g, '$1')
        .trim();

      try {
        const parsed = JSON.parse(sanitizedContent);

        if (!parsed.courseTitle || !Array.isArray(parsed.topics)) {
          throw new Error('Invalid response structure: missing required fields');
        }

        parsed.topics.forEach((topic, index) => {
          if (!topic.id || !topic.title || typeof topic.depth !== 'number') {
            throw new Error(`Invalid topic structure at index ${index}`);
          }
        });

        return {
          result: rawContent,
          parsed
        };
      } catch (parseError) {
        console.error('JSON parsing error:', {
          error: parseError.message,
          sanitizedContent: sanitizedContent.slice(0, 200)
        });
        throw new Error(`Failed to parse AI response: ${parseError.message}`);
      }
    } catch (error) {
      lastError = error;
      console.error('Error in OpenRouter service:', error);
      if (retryCount < MAX_RETRIES - 1) {
        console.log(`Attempt ${retryCount + 1} failed, retrying in ${RETRY_DELAY}ms...`);
        await delay(RETRY_DELAY);
        retryCount++;
        continue;
      }
      throw error;
    }
  }

  throw lastError || new Error(`Failed after ${MAX_RETRIES} attempts`);
}