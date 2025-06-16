'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ImageIcon } from 'lucide-react';

type WhiteboardDisplayProps = {
  images: string[];
  currentStep: number;
};

export function WhiteboardDisplay({ images, currentStep }: WhiteboardDisplayProps) {
  const [showImage, setShowImage] = useState(true);
  const [imageToDisplay, setImageToDisplay] = useState<string | null>(null);

  useEffect(() => {
    if (images && images.length > 0 && currentStep >= 0 && currentStep < images.length) {
      const newImage = images[currentStep];
      if (newImage !== imageToDisplay) {
        setShowImage(false); // Start fade out
        setTimeout(() => {
          setImageToDisplay(newImage);
          setShowImage(true); // Start fade in
        }, 250); // Half of animation duration for smooth transition
      } else if (!imageToDisplay) { // Initial load
        setImageToDisplay(newImage);
        setShowImage(true);
      }
    } else {
      setImageToDisplay(null); // No image if steps/images are empty or currentStep is invalid
    }
  }, [currentStep, images, imageToDisplay]);

  if (!images || images.length === 0) {
    return (
      <Card className="aspect-video w-full flex items-center justify-center bg-muted/30 border-dashed">
        <CardContent className="text-center text-muted-foreground p-6">
          <ImageIcon size={48} className="mx-auto mb-4" />
          <p className="font-headline text-xl">Whiteboard Area</p>
          <p>Solve a problem to see the visual steps here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="aspect-video w-full overflow-hidden shadow-xl">
      <CardContent className="p-0 h-full w-full flex items-center justify-center">
        {imageToDisplay ? (
          <div className={`relative w-full h-full transition-opacity duration-500 ease-in-out ${showImage ? 'opacity-100' : 'opacity-0'}`}>
            <Image
              src={imageToDisplay}
              alt={`Solution step ${currentStep + 1}`}
              layout="fill"
              objectFit="contain"
              unoptimized // Since these are data URIs
              data-ai-hint="math diagram"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <ImageIcon size={48} className="mb-2" />
            <p>Loading step...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
