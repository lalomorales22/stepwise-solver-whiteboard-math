'use client';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type PlaybackControlsProps = {
  totalSteps: number;
  currentStep: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (step: number) => void;
  isInteractive: boolean; // True if a solution is loaded
};

export function PlaybackControls({
  totalSteps,
  currentStep,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onSeek,
  isInteractive,
}: PlaybackControlsProps) {
  const handleSeek = (value: number[]) => {
    onSeek(value[0]);
  };

  if (!isInteractive) {
    return (
      <div className="w-full p-4 bg-card border shadow-md rounded-lg mt-4 text-center">
        <Info size={24} className="mx-auto mb-2 text-muted-foreground" />
        <p className="text-muted-foreground font-medium">Playback controls will appear here once a solution is generated.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="w-full p-4 md:p-6 bg-card border shadow-md rounded-lg mt-4">
        <div className="flex items-center justify-center gap-3 md:gap-4 mb-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onPrev} disabled={currentStep === 0}>
                <SkipBack className="h-6 w-6" />
                <span className="sr-only">Previous Step</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Previous Step</p></TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="primary" size="icon" onClick={onPlayPause} className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>{isPlaying ? 'Pause' : 'Play'}</p></TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onNext} disabled={currentStep === totalSteps - 1}>
                <SkipForward className="h-6 w-6" />
                <span className="sr-only">Next Step</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Next Step</p></TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Step {currentStep + 1} / {totalSteps}
          </span>
          <Slider
            min={0}
            max={totalSteps > 0 ? totalSteps - 1 : 0}
            step={1}
            value={[currentStep]}
            onValueChange={handleSeek}
            disabled={totalSteps === 0}
            aria-label="Solution step seeker"
            className="flex-grow"
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
