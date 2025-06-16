
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '@/components/Header';
import { ProblemInputForm } from '@/components/ProblemInputForm';
import { WhiteboardDisplay } from '@/components/WhiteboardDisplay';
import { PlaybackControls } from '@/components/PlaybackControls';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { solveProblemAction } from '@/actions/solverActions';
import type { SolutionData } from '@/types';
import { saveProblemToGallery } from '@/lib/problem-storage';
import { Save } from 'lucide-react'; // Removed Loader2 as it's not directly used here
import { useSearchParams, useRouter } from 'next/navigation';
import { loadProblemFromGallery } from '@/lib/problem-storage';


export default function SolverPage() {
  const [problemStatement, setProblemStatement] = useState(''); 
  const [solutionSteps, setSolutionSteps] = useState<string[]>([]); // These are for display (e.g. with HTML)
  const [whiteboardStepTexts, setWhiteboardStepTexts] = useState<string[]>([]);
  const [narrationTexts, setNarrationTexts] = useState<string[]>([]); // Speakable texts
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { speak, cancel, isSpeaking, isSupported } = useSpeechSynthesis();

  const searchParams = useSearchParams();
  const router = useRouter();
  const initialLoadRef = useRef(true);


  useEffect(() => {
    if (initialLoadRef.current) {
      const problemIdToLoad = searchParams.get('loadProblemId');
      if (problemIdToLoad) {
        const problemData = loadProblemFromGallery(problemIdToLoad);
        if (problemData) {
          setProblemStatement(problemData.problemStatement);
          setSolutionSteps(problemData.solutionSteps);
          setWhiteboardStepTexts(problemData.whiteboardStepTexts); 
          setNarrationTexts(problemData.narrationTexts);
          setCurrentStep(0);
          setIsPlaying(false);
          // Clear the query param from URL after loading
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('loadProblemId');
          router.replace(newUrl.pathname + newUrl.search, { scroll: false });
        } else {
          toast({ title: "Error", description: "Could not load the specified problem.", variant: "destructive" });
        }
      }
      initialLoadRef.current = false;
    }
  }, [searchParams, toast, router]);


  const resetSolutionState = () => {
    setSolutionSteps([]);
    setWhiteboardStepTexts([]); 
    setNarrationTexts([]);
    setCurrentStep(0);
    setIsPlaying(false);
    if (isSpeaking) cancel(); 
  };

  const handleSolve = async (data: { problemText?: string; imageDataUri?: string }) => {
    setIsLoading(true);
    resetSolutionState();
    setProblemStatement(data.problemText && !data.imageDataUri ? data.problemText : 'Analyzing problem...');


    try {
      const result = await solveProblemAction({ problem: data.problemText, imageDataUri: data.imageDataUri });
      
      setProblemStatement(result.problemStatement); 
      setSolutionSteps(result.solutionSteps); // For display
      setWhiteboardStepTexts(result.whiteboardStepTexts); // Also for display, currently same as solutionSteps
      setNarrationTexts(result.narrationTexts); // Speakable texts

      if (result.solutionSteps.length === 0 || result.whiteboardStepTexts.length === 0 || result.narrationTexts.length === 0) {
        toast({
          title: 'Solution Incomplete',
          description: 'The AI could not generate a complete solution. Some parts might be missing. Please try rephrasing or providing a clearer image.',
          variant: 'destructive',
        });
      } else {
         toast({
          title: 'Solution Generated!',
          description: 'Your problem has been solved. Press play to view the steps.',
        });
      }
     
    } catch (error) {
      console.error(error);
      setProblemStatement(''); 
      toast({
        title: 'Error Solving Problem',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const playStepAudio = useCallback((stepIndex: number) => {
    if (isSupported && narrationTexts[stepIndex]) {
      speak(narrationTexts[stepIndex], () => { // onEnd callback
        if (isPlaying && stepIndex < narrationTexts.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          setIsPlaying(false); 
        }
      });
    } else if (isPlaying && stepIndex < narrationTexts.length - 1) { // TTS not supported, but still playing
        // Advance step after a delay to simulate audio playback
        setTimeout(() => { 
            if(isPlaying) setCurrentStep(prev => prev + 1);
        }, 1500); // Adjust delay as needed
    } else if (isPlaying && stepIndex >= narrationTexts.length - 1) { // Reached end while playing (without TTS)
        setIsPlaying(false); 
    }
  }, [isSupported, narrationTexts, speak, isPlaying]);


  useEffect(() => {
    if (isPlaying && narrationTexts.length > 0 && currentStep < narrationTexts.length) {
      playStepAudio(currentStep);
    } else if (!isPlaying && isSpeaking) { // If manually paused
      cancel(); 
    }
  }, [isPlaying, currentStep, playStepAudio, narrationTexts, cancel, isSpeaking]);


  const handlePlayPause = () => {
    if (narrationTexts.length === 0) return;

    if (!isPlaying && currentStep >= narrationTexts.length - 1 && narrationTexts.length > 0) {
        // If at the end and play is pressed, reset to the beginning
        setCurrentStep(0);
        setIsPlaying(true); // Start playing from the beginning
    } else {
        setIsPlaying(prev => !prev);
    }
  };

  const handleNext = () => {
    if (currentStep < narrationTexts.length - 1) {
      setCurrentStep(prev => prev + 1);
      if (isPlaying || isSpeaking) cancel(); 
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      if (isPlaying || isSpeaking) cancel(); 
    }
  };

  const handleSeek = (step: number) => {
    if (step >= 0 && step < narrationTexts.length) {
      setCurrentStep(step);
      if (isPlaying || isSpeaking) cancel();
    }
  };

  const handleSaveProblem = () => {
    if (solutionSteps.length === 0 || !problemStatement) {
      toast({ title: 'Cannot Save', description: 'Solve a problem first before saving.', variant: 'destructive' });
      return;
    }
    try {
      const solutionData: SolutionData = { problemStatement, solutionSteps, whiteboardStepTexts, narrationTexts }; 
      saveProblemToGallery(solutionData);
      toast({ title: 'Problem Saved!', description: 'The current problem and solution have been saved to your gallery.' });
    } catch (error) {
      toast({ title: 'Error Saving', description: 'Could not save the problem.', variant: 'destructive' });
    }
  };
  
  const canSave = solutionSteps.length > 0 && problemStatement.length > 0 && problemStatement !== 'Analyzing problem...';


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <ProblemInputForm onSolve={handleSolve} isLoading={isLoading} initialProblemText={problemStatement} />
          </div>
          <div className="md:col-span-2 space-y-6">
            {problemStatement && problemStatement !== 'Analyzing problem...' && (
                <div className="p-4 bg-card border shadow-sm rounded-lg">
                    <h2 className="text-lg font-headline text-primary mb-1">Problem:</h2>
                    <p className="text-muted-foreground">{problemStatement}</p>
                </div>
            )}
            <WhiteboardDisplay steps={whiteboardStepTexts} currentStep={currentStep} problemStatement={problemStatement} /> 
            <PlaybackControls
              totalSteps={narrationTexts.length} // Controls should be based on narration texts length
              currentStep={currentStep}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onNext={handleNext}
              onPrev={handlePrev}
              onSeek={handleSeek}
              isInteractive={narrationTexts.length > 0}
            />
            {canSave && (
                <Button onClick={handleSaveProblem} variant="secondary" className="w-full">
                    <Save size={18} className="mr-2" /> Save to Gallery
                </Button>
            )}
          </div>
        </div>
      </main>
      <footer className="text-center py-4 border-t text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} StepWise Solver. All rights reserved.</p>
      </footer>
    </div>
  );
}
