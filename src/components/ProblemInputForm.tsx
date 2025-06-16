'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Paperclip, Send } from 'lucide-react';

const formSchema = z.object({
  problemText: z.string().min(5, { message: 'Problem description must be at least 5 characters.' }),
  problemImage: z.any().optional(), // For file input
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSolve(values.problemText);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFileName(event.target.files[0].name);
      // Actual file processing would happen here if integrated with an OCR or image-understanding AI
    } else {
      setFileName(null);
    }
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

        <FormItem>
          <FormLabel className="text-lg font-headline">Or upload an image (optional)</FormLabel>
          <div className="flex items-center gap-2">
            <FormControl>
               <Input 
                type="file" 
                id="problemImage" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => {
                  form.setValue('problemImage', e.target.files); // RHF tracking
                  handleFileChange(e); // UI update
                }}
                aria-label="Upload problem image"
              />
            </FormControl>
            <Button type="button" variant="outline" asChild>
              <label htmlFor="problemImage" className="cursor-pointer">
                <Paperclip className="mr-2 h-4 w-4" /> Choose File
              </label>
            </Button>
            {fileName && <span className="text-sm text-muted-foreground">{fileName}</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Image upload is for reference. Please type the problem text above.</p>
        </FormItem>
        
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
