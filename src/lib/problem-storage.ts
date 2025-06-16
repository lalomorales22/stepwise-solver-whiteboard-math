'use client';
import type { SavedProblem, SolutionData } from '@/types';

const GALLERY_KEY = 'stepwiseSolverGallery';

export function getProblemsFromGallery(): SavedProblem[] {
  if (typeof window === 'undefined') return [];
  const rawData = localStorage.getItem(GALLERY_KEY);
  if (!rawData) return [];
  try {
    const problems = JSON.parse(rawData) as SavedProblem[];
    // Ensure all problems have the new whiteboardStepTexts field, even if loading old data
    return problems.map(p => ({
      ...p,
      whiteboardStepTexts: p.whiteboardStepTexts || (p as any).whiteboardImages || [], // Handle migration from old whiteboardImages
    }));
  } catch (error) {
    console.error("Error parsing problems from localStorage:", error);
    return [];
  }
}

export function saveProblemToGallery(problemData: SolutionData): SavedProblem {
  if (typeof window === 'undefined') throw new Error("localStorage not available");
  const problems = getProblemsFromGallery();
  const newProblem: SavedProblem = {
    ...problemData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    whiteboardStepTexts: problemData.whiteboardStepTexts || [], // Ensure it's always present
  };
  problems.unshift(newProblem); 
  localStorage.setItem(GALLERY_KEY, JSON.stringify(problems.slice(0, 50))); 
  return newProblem;
}

export function deleteProblemFromGallery(id: string): void {
  if (typeof window === 'undefined') return;
  let problems = getProblemsFromGallery();
  problems = problems.filter(p => p.id !== id);
  localStorage.setItem(GALLERY_KEY, JSON.stringify(problems));
}

export function loadProblemFromGallery(id: string): SavedProblem | null {
    if (typeof window === 'undefined') return null;
    const problems = getProblemsFromGallery();
    const problem = problems.find(p => p.id === id) || null;
    if (problem) {
      return {
        ...problem,
        whiteboardStepTexts: problem.whiteboardStepTexts || (problem as any).whiteboardImages || [], // Handle migration
      };
    }
    return null;
}
