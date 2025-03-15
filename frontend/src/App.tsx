import React, { useState } from 'react';
import { CourseFlow } from './components/CourseFlow';
import { Upload, Plus, Download, Loader2, X } from 'lucide-react';
import { useCourseStore } from './store/courseStore';
import { processSyllabus } from './utils/openRouter';
import { ChatInterface } from './components/ChatInterface';

function App() {
  const { course, setCourse } = useCourseStore();
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        const content = await file.text();
        const processedData = await processSyllabus(content);
        setCourse(processedData);
      } catch (error) {
        console.error('Error processing syllabus:', error);
        alert('Error processing syllabus. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!course ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h1 className="text-2xl font-bold mb-6 text-center">
              AI Lecture Planner
            </h1>
            {showChat ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Create New Course</h2>
                  <button
                    onClick={() => setShowChat(false)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>
                <ChatInterface />
              </div>
            ) : (
              <div className="space-y-4">
                <label className="relative block">
                  <button 
                    className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        <span>Upload Syllabus</span>
                      </>
                    )}
                  </button>
                  <input
                    type="file"
                    className="hidden"
                    accept=".txt,.doc,.docx,.pdf"
                    onChange={handleFileUpload}
                    disabled={loading}
                  />
                </label>
                <button 
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  onClick={() => setShowChat(true)}
                  disabled={loading}
                >
                  <Plus size={20} />
                  <span>Create New Course</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="h-screen flex flex-col">
          <header className="bg-white shadow-sm p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <h1 className="text-xl font-semibold">{course.title}</h1>
              <button className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                <Download size={16} />
                <span>Export Course</span>
              </button>
            </div>
          </header>
          <main className="flex-1">
            <CourseFlow />
          </main>
        </div>
      )}
    </div>
  );
}

export default App;