import React from 'react';
import { Handle, Position } from 'reactflow';
import { Edit2, Trash2, Clock, Book, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Topic } from '../types';
import { Button } from '../ui/button';

interface TopicNodeProps {
  data: {
    onEdit: (topic: Topic) => void;
    onDelete: (id: string) => void;
    onAddTopic: (id: string) => void;
    depth: number;
    parentId?: string;
  } & Topic;
}

const depthColors: Record<number, string> = {
  1: 'bg-blue-50 border-2 border-blue-200',
  2: 'bg-purple-50 border-2 border-purple-200',
  3: 'bg-indigo-50 border-2 border-indigo-200',
  4: 'bg-violet-50 border-2 border-violet-200'
};

const difficultyColors: Record<number, string> = {
  1: 'bg-green-100 border-green-200',
  2: 'bg-green-200 border-green-300',
  3: 'bg-yellow-100 border-yellow-200',
  4: 'bg-orange-100 border-orange-200',
  5: 'bg-red-100 border-red-200'
};

export const TopicNode: React.FC<TopicNodeProps> = ({ data }) => {
  const [expandedSection, setExpandedSection] = React.useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  return (
    <div className={`p-4 rounded-lg shadow-md ${depthColors[data.depth] || 'bg-white'} ${difficultyColors[data.difficulty || 1]} border-2 w-80`}>
      <Handle type="target" position={Position.Top} />
      
      <div className="flex justify-between items-start mb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{data.title}</h3>
            {data.depth > 1 && (
              <span className="text-sm text-gray-500">
                (Subtask of {data.parentId})
              </span>
            )}
          </div>
          {data.description && (
            <p className="text-sm text-gray-600">{data.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => data.onAddTopic(data.id)}
            aria-label="Add topic"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => data.onEdit(data)}
            aria-label="Edit topic"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => data.onDelete(data.id)}
            aria-label="Delete topic"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <Clock size={14} />
        <span>{data.duration || 30} mins</span>
        <Book size={14} className="ml-2" />
        <span>Difficulty: {data.difficulty || 1}/5</span>
      </div>

      <div className="space-y-2">
        {data.prerequisites && data.prerequisites.length > 0 && (
          <div className="text-sm">
            <span className="font-medium">Prerequisites:</span>{' '}
            {data.prerequisites.join(', ')}
          </div>
        )}

        {[
          { key: 'keyConcepts', label: 'Key Concepts' },
          { key: 'learningObjectives', label: 'Learning Objectives' },
          { key: 'subtopicBreakdown', label: 'Subtopic Breakdown' },
          { key: 'commonMisconceptions', label: 'Common Misconceptions' },
          { key: 'assessmentIdeas', label: 'Assessment Ideas' },
          { key: 'interactiveActivities', label: 'Interactive Activities' },
          { key: 'caseStudies', label: 'Case Studies' },
          { key: 'teachingTips', label: 'Teaching Tips' },
          { key: 'suggestedResources', label: 'Suggested Resources' },
        ].map(({ key, label }) => (
          data[key as keyof Topic] && (
            <div key={key} className="border rounded-lg">
              <button
                className="w-full p-2 flex justify-between items-center hover:bg-gray-50"
                onClick={() => toggleSection(key)}
              >
                <span className="font-medium">{label}</span>
                {expandedSection === key ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              
              {expandedSection === key && (
                <div className="p-2 pt-0 border-t">
                  <ul className="list-disc pl-4 space-y-1">
                    {(data[key as keyof Topic] as string[]).map((item, i) => (
                      <li key={i} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        ))}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};