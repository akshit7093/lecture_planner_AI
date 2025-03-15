import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { callOpenRouter } from '../utils/openRouter';
import { useCourseStore } from '../store/courseStore';

export function ChatInterface() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { setCourse } = useCourseStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    try {
      const prompt = `You are a course creation assistant. Based on the following description, create a detailed course structure. Return ONLY the JSON object without any markdown formatting, comments, or additional text.

Description: "${input}"

The response must be a valid JSON object with this exact structure:
{
  "id": "unique-id",
  "title": "course title",
  "description": "course description",
  "targetLevel": "target level",
  "topics": [
    {
      "id": "unique-id",
      "title": "topic title",
      "description": "topic description",
      "difficulty": 1-5,
      "duration": minutes,
      "prerequisites": ["prereq1", "prereq2"],
      "learningObjectives": ["objective1", "objective2"],
      "resources": ["resource1", "resource2"]
    }
  ]
}`;

      const response = await callOpenRouter([
        { role: 'user', content: prompt }
      ]);

      // Clean the response of any potential markdown or extra whitespace
      const cleanedResponse = response.trim().replace(/^```json\s*|\s*```$/g, '');
      
      const courseData = JSON.parse(cleanedResponse);
      setCourse(courseData);
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Error creating course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your course (e.g., 'Create a course about machine learning fundamentals for beginners')"
            className="w-full h-32 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className={`w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors ${
            loading || !input.trim() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Generating Course...</span>
            </>
          ) : (
            <>
              <Send size={20} />
              <span>Create Course</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}