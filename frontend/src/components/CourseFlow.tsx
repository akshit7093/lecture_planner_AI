import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Panel,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TopicNode } from './TopicNode';
import { SyllabusSummary } from './SyllabusSummary';
import { useCourseStore } from '../store/courseStore';
import { Topic } from '../types';

const nodeTypes = {
  topic: TopicNode,
};

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

    const newNodes = course.topics.map((topic, index) => ({
      id: topic.id,
      type: 'topic',
      position: { x: 100 + index * 300, y: 100 + (index % 2) * 100 },
      data: { 
        ...topic, 
        onEdit: handleEdit, 
        onDelete: handleDelete,
        onAddTopic: handleAddTopic
      },
    }));

    const newEdges = course.topics.slice(1).map((topic, index) => ({
      id: `e${index}`,
      source: course.topics[index].id,
      target: topic.id,
    }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, [course, handleEdit, handleDelete, handleAddTopic]);

  return (
    <div className="h-screen w-full">
      <SyllabusSummary />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
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