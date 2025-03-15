export interface Topic {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  difficulty?: number;
  prerequisites?: string[];
  keyConcepts?: string[];
  learningObjectives?: string[];
  subtopicBreakdown?: string[];
  commonMisconceptions?: string[];
  assessmentIdeas?: string[];
  teachingTips?: string[];
  suggestedResources?: string[];
  parentId?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  targetLevel: string;
  topics: Topic[];
}

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Topic;
  parentId?: string;
  depth: number;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
}