import { create } from 'zustand';
import { Course, Topic } from '../types';

interface CourseState {
  course: Course | null;
  setCourse: (course: Course) => void;
  addTopic: (topic: Topic) => void;
  updateTopic: (id: string, topic: Topic) => void;
  removeTopic: (id: string) => void;
  reorderTopics: (topics: Topic[]) => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  course: null,
  setCourse: (course) => set({ course }),
  addTopic: (topic) =>
    set((state) => ({
      course: state.course
        ? { ...state.course, topics: [...state.course.topics, topic] }
        : null,
    })),
  updateTopic: (id, topic) =>
    set((state) => ({
      course: state.course
        ? {
            ...state.course,
            topics: state.course.topics.map((t) => (t.id === id ? topic : t)),
          }
        : null,
    })),
  removeTopic: (id) =>
    set((state) => ({
      course: state.course
        ? {
            ...state.course,
            topics: state.course.topics.filter((t) => t.id !== id),
          }
        : null,
    })),
  reorderTopics: (topics) =>
    set((state) => ({
      course: state.course ? { ...state.course, topics } : null,
    })),
}));