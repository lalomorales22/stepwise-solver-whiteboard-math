'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getProblemsFromGallery, deleteProblemFromGallery, SavedProblem } from '@/lib/problem-storage';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Eye, Info } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';


export default function GalleryClientPage() {
  const [savedProblems, setSavedProblems] = useState<SavedProblem[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setSavedProblems(getProblemsFromGallery());
  }, []);

  const handleDelete = (id: string) => {
    deleteProblemFromGallery(id);
    setSavedProblems(getProblemsFromGallery()); // Refresh list
    toast({ title: "Problem Deleted", description: "The problem has been removed from your gallery."});
  };

  const handleLoadProblem = (id: string) => {
    router.push(`/?loadProblemId=${id}`);
  };

  if (savedProblems.length === 0) {
    return (
      <div className="text-center py-10">
        <Info size={48} className="mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-headline mb-2">Your Gallery is Empty</h2>
        <p className="text-muted-foreground mb-4">Problems you save will appear here.</p>
        <Button asChild>
          <Link href="/">Solve a new problem</Link>
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)]"> {/* Adjust height as needed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
        {savedProblems.map((problem) => (
          <Card key={problem.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline text-xl line-clamp-2">{problem.problemStatement}</CardTitle>
              <CardDescription>
                Saved {formatDistanceToNow(new Date(problem.createdAt), { addSuffix: true })}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {problem.solutionSteps[0] || "No solution steps preview available."}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => handleLoadProblem(problem.id)}>
                <Eye size={16} className="mr-2" /> View
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 size={16} />
                     <span className="sr-only">Delete problem</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the saved problem from your gallery.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(problem.id)} className="bg-destructive hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
