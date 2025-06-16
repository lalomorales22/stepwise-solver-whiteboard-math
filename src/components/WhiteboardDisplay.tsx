
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckSquare } from 'lucide-react';

type WhiteboardDisplayProps = {
  steps: string[]; 
  currentStep: number;
  problemStatement?: string; 
};

export function WhiteboardDisplay({ steps, currentStep, problemStatement }: WhiteboardDisplayProps) {
  const [showStep, setShowStep] = useState(true);
  const [stepToDisplay, setStepToDisplay] = useState<string | null>(null);

  useEffect(() => {
    if (steps && steps.length > 0 && currentStep >= 0 && currentStep < steps.length) {
      const newStepText = steps[currentStep];
      if (newStepText !== stepToDisplay) {
        setShowStep(false); 
        setTimeout(() => {
          setStepToDisplay(newStepText);
          setShowStep(true); 
        }, 200); 
      } else if (!stepToDisplay && newStepText) { 
        setStepToDisplay(newStepText);
        setShowStep(true);
      }
    } else if ((!steps || steps.length === 0) && currentStep === 0) { // Reset if no steps
      setStepToDisplay(null);
    }
  }, [currentStep, steps, stepToDisplay]);

  if (!steps || steps.length === 0) {
    return (
      <Card className="aspect-video w-full flex flex-col items-center justify-center bg-muted/20 border-2 border-dashed border-muted-foreground/30 rounded-xl shadow-inner">
        <CardContent className="text-center text-muted-foreground p-6 flex flex-col items-center justify-center">
          <CheckSquare size={56} className="mx-auto mb-4 text-primary/50" />
          <p className="font-headline text-xl text-primary/80">AI Whiteboard</p>
          <p className="mt-1">Solve a problem to see the visual steps here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="aspect-video w-full overflow-hidden shadow-xl bg-slate-50 flex flex-col rounded-xl border-muted-foreground/20">
       <CardHeader className="py-3 px-4 border-b bg-slate-100">
        <CardTitle className="text-lg font-headline text-primary/90 flex items-center">
          <FileText size={20} className="mr-2 text-accent" />
          Step {currentStep + 1} of {steps.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex-grow flex items-center justify-center overflow-y-auto">
        {stepToDisplay ? (
          <div 
            className={`w-full h-full transition-opacity duration-300 ease-in-out ${showStep ? 'opacity-100' : 'opacity-0'}`}
          >
            <div 
              className="text-lg md:text-xl font-medium text-gray-800 whitespace-pre-wrap break-words text-center leading-relaxed"
              dangerouslySetInnerHTML={{ __html: stepToDisplay }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <FileText size={48} className="mb-2" />
            <p>Loading step...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
