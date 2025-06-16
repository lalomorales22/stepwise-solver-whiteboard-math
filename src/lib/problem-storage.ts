'use client';
import type { SavedProblem, SolutionData } from '@/types';

const GALLERY_KEY = 'stepwiseSolverGallery';

export function getProblemsFromGallery(): SavedProblem[] {
  if (typeof window === 'undefined') return [];
  const rawData = localStorage.getItem(GALLERY_KEY);
  return rawData ? JSON.parse(rawData) : [];
}

export function saveProblemToGallery(problemData: SolutionData): SavedProblem {
  if (typeof window === 'undefined') throw new Error("localStorage not available");
  const problems = getProblemsFromGallery();
  const newProblem: SavedProblem = {
    ...problemData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  problems.unshift(newProblem); // Add to the beginning
  localStorage.setItem(GALLERY_KEY, JSON.stringify(problems.slice(0, 50))); // Limit to 50 problems
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
    return problems.find(p => p.id === id) || null;
}
