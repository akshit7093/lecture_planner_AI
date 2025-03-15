import React from 'react';
import { Clock, Book, ListChecks } from 'lucide-react';
import { useCourseStore } from '../store/courseStore';

export const SyllabusSummary: React.FC = () => {
  const { course } = useCourseStore();

  if (!course) return null;

  const totalDuration = course.topics.reduce((sum, topic) => sum + (topic.duration || 30), 0);
  const totalTopics = course.topics.length;
  const averageDifficulty = Math.round(
    course.topics.reduce((sum, topic) => sum + (topic.difficulty || 1), 0) / totalTopics
  );

  return (
    <div className="bg-white shadow-sm border-b p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium">
              Total Duration: {Math.round(totalDuration / 60)} hours {totalDuration % 60} mins
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium">Total Topics: {totalTopics}</span>
          </div>
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium">
              Average Difficulty: {averageDifficulty}/5
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};