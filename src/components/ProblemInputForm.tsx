
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Send, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  problemText: z.string().min(5, { message: 'Problem description must be at least 5 characters.' }),
  problemImage: z.any().optional(), // For file input (FileList or File[])
});

type ProblemInputFormProps = {
  onSolve: (problemText: string) => void;
  isLoading: boolean;
};

export function ProblemInputForm({ onSolve, isLoading }: ProblemInputFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      problemText: '',
    },
  });

  const [fileName, setFileName] = React.useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSolve(values.problemText);
  }

  const processFiles = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setFileName(file.name);
        form.setValue('problemImage', files); // Store the FileList for RHF
      } else {
        setFileName('Invalid file type. Please upload an image.');
        form.setValue('problemImage', undefined); // Clear if invalid
        // Consider using toast here for better UX if available/passed
      }
    } else {
      setFileName(null);
      form.setValue('problemImage', undefined);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(event.target.files);
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation(); // Necessary to allow drop
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
    processFiles(event.dataTransfer.files);
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 md:p-6 bg-card shadow-lg rounded-lg border">
        <FormField
          control={form.control}
          name="problemText"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-headline">Enter your math problem</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Solve for x: 2x + 5 = 15"
                  className="min-h-[120px] resize-none text-base"
                  {...field}
                  aria-label="Math problem input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="problemImage"
          render={({ field: { onChange, onBlur, name, ref, ...restField } }) => ( // Destructure field to use parts with custom handling
            <FormItem>
              <FormLabel className="text-lg font-headline">Or upload an image (optional)</FormLabel>
              <div
                className={cn(
                  "mt-2 flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                  isDraggingOver ? "border-primary bg-primary/10" : "border-input hover:border-primary/70"
                )}
                onClick={handleDropZoneClick}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                aria-label="Drop image here or click to select an image file"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
                  <UploadCloud className={cn("w-10 h-10 mb-3", isDraggingOver ? "text-primary" : "text-muted-foreground")} />
                  <p className={cn("mb-1 text-sm", isDraggingOver ? "text-primary" : "text-muted-foreground")}>
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className={cn("text-xs", isDraggingOver ? "text-primary" : "text-muted-foreground")}>
                    Image (PNG, JPG, etc.)
                  </p>
                  {fileName && (
                    <span className={cn("mt-2 text-xs px-2 py-1 rounded-md", isDraggingOver ? "text-primary bg-primary/20" : "text-foreground bg-muted")}>
                      {fileName}
                    </span>
                  )}
                </div>
                <FormControl>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    id="problemImageFile"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileInputChange} // Our handler calls form.setValue
                    onBlur={onBlur} // RHF validation trigger
                    name={name} // RHF field name
                    // value is not set for file inputs
                  />
                </FormControl>
              </div>
              <FormMessage />
              <p className="text-xs text-muted-foreground mt-1">Image upload is for reference. Please type the problem text above.</p>
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isLoading} className="w-full text-lg py-6">
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Solving...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" /> Solve Problem
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
