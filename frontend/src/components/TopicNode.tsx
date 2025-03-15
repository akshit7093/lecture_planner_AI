import React, { useState } from 'react';
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
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTopic, setEditedTopic] = useState<Topic>(data);

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const handleEditClick = () => {
    setEditedTopic(data);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    data.onEdit(editedTopic);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedTopic(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (field: keyof Topic, index: number, value: string) => {
    setEditedTopic(prev => {
      const currentArray = [...(prev[field] as string[] || [])];
      currentArray[index] = value;
      return {
        ...prev,
        [field]: currentArray
      };
    });
  };

  const addArrayItem = (field: keyof Topic) => {
    setEditedTopic(prev => {
      const currentArray = [...(prev[field] as string[] || [])];
      return {
        ...prev,
        [field]: [...currentArray, '']
      };
    });
  };

  const removeArrayItem = (field: keyof Topic, index: number) => {
    setEditedTopic(prev => {
      const currentArray = [...(prev[field] as string[] || [])];
      currentArray.splice(index, 1);
      return {
        ...prev,
        [field]: currentArray
      };
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedTopic(prev => ({
      ...prev,
      [name]: parseInt(value, 10) || 0
    }));
  };

  if (isEditing) {
    return (
      <div className="p-4 rounded-lg shadow-md bg-white border-2 border-blue-400 w-96 relative overflow-y-auto max-h-[80vh]"
           style={{
             touchAction: 'pan-y',
             WebkitOverflowScrolling: 'touch',
             overscrollBehavior: 'contain'
           }}
           onTouchStart={(e) => e.stopPropagation()}
           onTouchMove={(e) => e.stopPropagation()}>
        <div className="space-y-3 touch-pan-y">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={editedTopic.title}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={editedTopic.description || ''}
              onChange={handleInputChange}
              className="w-full p-2 border rounded h-20"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Duration (mins)</label>
              <input
                type="number"
                name="duration"
                value={editedTopic.duration || 30}
                onChange={handleNumberChange}
                min="1"
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Difficulty (1-5)</label>
              <input
                type="number"
                name="difficulty"
                value={editedTopic.difficulty || 1}
                onChange={handleNumberChange}
                min="1"
                max="5"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* Additional editable fields */}
          {[
            { key: 'prerequisites', label: 'Prerequisites' },
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
            <div key={key} className="border rounded-lg mt-3">
              <button
                type="button"
                className="w-full p-2 flex justify-between items-center hover:bg-gray-50 text-left"
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
                  {(editedTopic[key as keyof Topic] as string[] || []).map((item, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleArrayInputChange(key as keyof Topic, index, e.target.value)}
                        className="flex-1 p-1 border rounded text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem(key as keyof Topic, index)}
                        className="p-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addArrayItem(key as keyof Topic)}
                    className="w-full mt-1 text-blue-600 hover:text-blue-800"
                  >
                    + Add {label.slice(0, -1)}
                  </Button>
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg shadow-md ${depthColors[data.depth] || 'bg-white'} ${difficultyColors[data.difficulty || 1]} border-2 w-80 relative`}>
      {data.depth > 1 && (
        <div 
          className={`absolute top-1/2 -left-4 w-4 h-px ${depthColors[data.depth - 1]?.split(' ')[1]}`}
          style={{ transform: 'translateY(-50%)' }}
        />
      )}
      <Handle 
        type="target" 
        position={Position.Top} 
        id={`${data.id}-target`} 
        className="w-4 h-4 bg-blue-500 border-2 border-white cursor-crosshair !opacity-100" 
        isConnectable={true}
      />
      
      <div className="flex justify-between items-start mb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="relative">
            <h3 className="font-semibold text-lg">{data.title}</h3>
            {data.depth > 1 && (
              <div 
                className={`absolute -left-6 top-1/2 h-full w-0.5 ${depthColors[data.depth - 1]?.split(' ')[1]}`}
                style={{ transform: 'translateY(-50%)' }}
              />
            )}
          </div>
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
            onClick={handleEditClick}
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

      <Handle 
        type="source" 
        position={Position.Bottom} 
        id={`${data.id}-source`} 
        className="w-4 h-4 bg-blue-500 border-2 border-white cursor-crosshair !opacity-100" 
        isConnectable={true}
      />
    </div>
  );
};