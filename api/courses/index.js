import { processOpenRouterRequest } from '../../backend/src/services/openRouterService.js';

// Serverless function configuration
export const config = {
  runtime: 'edge',
};

// This is a Vercel Edge Function that handles all HTTP methods
export default async function handler(req) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  // Get the path from the URL
  const url = new URL(req.url);
  const path = url.pathname.replace('/api/courses', '');

  try {
    // Root endpoint
    if (path === '' || path === '/') {
      if (req.method === 'GET') {
        return new Response(JSON.stringify({ message: 'Courses API endpoint' }), { headers });
      }
    }
    
    // Process syllabus endpoint
    if (path === '/process-syllabus') {
      if (req.method === 'POST') {
        const body = await req.json();
        const { content } = body;
        
        if (!content) {
          return new Response(JSON.stringify({ error: 'Syllabus content is required' }), { status: 400, headers });
        }
        
        const result = await processOpenRouterRequest(content);
        return new Response(JSON.stringify(result), { headers });
      }
    }
    
    // Generate course content endpoint
    if (path === '/generate') {
      if (req.method === 'POST') {
        const body = await req.json();
        const { prompt } = body;
        
        if (!prompt) {
          return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400, headers });
        }
        
        const result = await processOpenRouterRequest(prompt);
        return new Response(JSON.stringify(result), { headers });
      }
    }
    
    // If no matching route or method
    return new Response(JSON.stringify({ error: 'Not found or method not allowed' }), { status: 404, headers });
  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), { status: 500, headers });
  }
}