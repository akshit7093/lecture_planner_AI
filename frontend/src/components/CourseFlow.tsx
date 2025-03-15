import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Panel,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TopicNode } from './TopicNode';
import { SyllabusSummary } from './SyllabusSummary';
import { useCourseStore } from '../store/courseStore';
import { Topic } from '../types';

const nodeTypes = {
  topic: TopicNode,
};

interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Topic & {
    depth: number;
    onEdit: (topic: Topic) => void;
    onDelete: (id: string) => void;
    onAddTopic: (parentId: string) => void;
  };
}

export const CourseFlow: React.FC = () => {
  const { course, updateTopic, removeTopic, addTopic } = useCourseStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const handleEdit = useCallback((topic: Topic) => {
    updateTopic(topic.id, topic);
  }, [updateTopic]);

  const handleDelete = useCallback((id: string) => {
    removeTopic(id);
  }, [removeTopic]);

  const handleAddTopic = useCallback((parentId: string) => {
    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      title: 'New Topic',
      description: '',
      duration: 30,
      difficulty: 1,
      parentId
    };
    addTopic(newTopic);
  }, [addTopic]);

  React.useEffect(() => {
    if (!course) return;

    const layoutNodes = (
  topics: Topic[],
  parentId: string | null = null,
  depth: number = 0,
  x: number = 0,
  y: number = 0
): { nodes: Node[]; nextX: number; nextY: number } => {
  let currentY = y;
  // Horizontal spacing between depth levels - increased for better readability
  const horizontalSpacing = 450; // Increased from 350
  // Calculate x position based on depth
  let currentX = x + depth * horizontalSpacing;
  let nodes: Node[] = [];

  // Get topics at current level
  const currentLevelTopics = topics.filter(t => t.parentId === parentId);
  
  // Process each topic at this level
  currentLevelTopics.forEach(topic => {
    // Create node for current topic
    const node: Node = {
      id: topic.id,
      type: 'topic',
      position: { x: currentX, y: currentY },
      data: {
        ...topic,
        depth: depth + 1,
        onEdit: handleEdit,
        onDelete: handleDelete,
        onAddTopic: handleAddTopic
      }
    };

    nodes.push(node);
    
    // Process children of this topic
    const childTopics = topics.filter(t => t.parentId === topic.id);
    if (childTopics.length > 0) {
      // Process children recursively, starting at a position to the right of current node
      const childrenResult = layoutNodes(
        topics, 
        topic.id, 
        depth + 1, 
        currentX + horizontalSpacing, 
        currentY
      );
      nodes = nodes.concat(childrenResult.nodes);
      // Update currentY to be below the last child
      currentY = childrenResult.nextY;
    } else {
      // If no children, just move down for the next topic at this level
      // Increased vertical spacing between nodes
      currentY += 250; // Increased from 150
    }
  });

  // Ensure there's some spacing after the last node
  return { nodes, nextX: currentX, nextY: currentY + 80 }; // Increased from 50
};

const layoutResult = layoutNodes(course.topics);
    const newNodes = layoutResult.nodes;

    const newEdges = course.topics
      .filter(topic => topic.parentId)
      .map(topic => ({
        id: `e-${topic.parentId}-${topic.id}`,
        source: topic.parentId!,
        target: topic.id,
        // Fixed handle IDs to match what's defined in TopicNode component
        sourceHandle: `${topic.parentId}-source`,
        targetHandle: `${topic.id}-target`,
        animated: false,
        type: 'default',
        style: { stroke: '#888', strokeWidth: 2 }
      }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, [course, handleEdit, handleDelete, handleAddTopic]);

  // Function to handle edge creation when user connects nodes
  const onConnect = useCallback((params: any) => {
    // Create a new edge with the connection parameters
    setEdges((eds) => {
      // Check if this connection already exists
      const connectionExists = eds.some(
        (edge) => edge.source === params.source && edge.target === params.target
      );
      
      if (connectionExists) return eds;
      
      // When a user creates a connection, add the new edge without removing existing ones
      const sourceId = params.source;
      const targetId = params.target;
      
      // Add the new edge to the existing edges with correct handle IDs
      return eds.concat({
        ...params,
        id: `e-${sourceId}-${targetId}`,
        // Make sure we're using the same handle ID format as in the node component
        sourceHandle: params.sourceHandle || `${sourceId}-source`,
        targetHandle: params.targetHandle || `${targetId}-target`,
        animated: false,
        style: { stroke: '#888', strokeWidth: 2 }
      });
    });
  }, [setEdges]);

  return (
    <div className="h-screen w-full">
      <SyllabusSummary />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        nodeOrigin={[0.5, 0.5]}
        connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 3, strokeOpacity: 0.8 }}
        connectionLineType={ConnectionLineType.Bezier}
        connectOnClick={true}
        defaultEdgeOptions={{
          style: { stroke: '#888', strokeWidth: 2 },
          type: 'default'
        }}
        connectionMode={ConnectionMode.Loose}
      >
        <Background />
        <Controls />
        <Panel position="top-left">
          <h2 className="text-xl font-bold mb-2">{course?.title}</h2>
          <p className="text-gray-600">{course?.description}</p>
        </Panel>
      </ReactFlow>
    </div>
  );
};