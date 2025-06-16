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
  problemText: z.string().optional(),
  problemImage: z.custom<FileList | undefined>().optional(),
}).superRefine((data, ctx) => {
  const hasImage = data.problemImage && data.problemImage.length > 0;
  const hasText = data.problemText && data.problemText.trim().length > 0;

  if (!hasImage && !hasText) {
    ctx.addIssue({
      path: ["problemText"], 
      message: "Please enter the problem text or upload an image of the problem.",
    });
  } else if (!hasImage && data.problemText && data.problemText.trim().length < 5) {
    ctx.addIssue({
      path: ["problemText"],
      message: "Problem description must be at least 5 characters if no image is provided.",
    });
  }
});

type ProblemInputFormProps = {
  onSolve: (data: { problemText?: string; imageDataUri?: string }) => void;
  isLoading: boolean;
  initialProblemText?: string; 
};

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function ProblemInputForm({ onSolve, isLoading, initialProblemText }: ProblemInputFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      problemText: initialProblemText || '',
      problemImage: undefined,
    },
  });

  React.useEffect(() => {
    if (initialProblemText !== undefined && initialProblemText !== 'Analyzing problem...') {
        form.setValue('problemText', initialProblemText);
    } else if (initialProblemText === 'Analyzing problem...') {
        form.setValue('problemText', ''); // Clear if it was just 'Analyzing problem...'
    }
  }, [initialProblemText, form]);


  const [fileName, setFileName] = React.useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let imageDataUri: string | undefined = undefined;
    if (values.problemImage && values.problemImage.length > 0) {
      try {
        imageDataUri = await fileToDataUri(values.problemImage[0]);
      } catch (error) {
        console.error("Error converting file to data URI:", error);
        form.setError("problemImage", { type: "manual", message: "Could not process image file." });
        return;
      }
    }
    onSolve({ problemText: values.problemText, imageDataUri });
  }

  const processFiles = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setFileName(file.name);
        form.setValue('problemImage', files); 
        form.clearErrors("problemImage");
        if (form.getValues("problemText")?.trim() === "") { 
            form.clearErrors("problemText");
        }
      } else {
        setFileName('Invalid file type. Please upload an image.');
        form.setValue('problemImage', undefined); 
        form.setError("problemImage", { type: "manual", message: "Invalid file type. Please upload an image."})
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
    event.stopPropagation(); 
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
  
  const problemTextValue = form.watch("problemText");
  const problemImageValue = form.watch("problemImage");


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 md:p-6 bg-card shadow-lg rounded-lg border">
        <div className="flex flex-col md:flex-row md:gap-6 space-y-6 md:space-y-0">
          <div className="flex-1">
            <FormField
              control={form.control}
              name="problemText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-headline">Enter math problem</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Solve for x: 2x + 5 = 15"
                      className="min-h-[160px] resize-none text-base"
                      {...field}
                      value={field.value ?? ''} 
                      aria-label="Math problem input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex-1">
            <FormField
              control={form.control}
              name="problemImage"
              render={({ fieldState }) => ( 
                <FormItem>
                  <FormLabel className="text-lg font-headline">Or upload image</FormLabel>
                  <div
                    className={cn(
                      "mt-2 flex flex-col items-center justify-center w-full h-[160px] border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                      isDraggingOver ? "border-primary bg-primary/10" : "border-input hover:border-primary/70",
                      fieldState.error ? "border-destructive" : ""
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
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none text-center">
                      <UploadCloud className={cn("w-8 h-8 mb-2", isDraggingOver ? "text-primary" : "text-muted-foreground")} />
                      <p className={cn("text-xs", isDraggingOver ? "text-primary" : "text-muted-foreground")}>
                        <span className="font-semibold">Click to upload</span> or drag & drop
                      </p>
                      {fileName && (
                        <span className={cn("mt-1 text-xs px-1.5 py-0.5 rounded-md truncate max-w-[90%]", isDraggingOver ? "text-primary bg-primary/20" : "text-foreground bg-muted", fieldState.error && fileName?.startsWith("Invalid") ? "bg-destructive text-destructive-foreground" : "")}>
                          {fileName}
                        </span>
                      )}
                       {!fileName && <p className={cn("text-xs mt-1", isDraggingOver ? "text-primary" : "text-muted-foreground")}>(PNG, JPG, etc.)</p>}
                    </div>
                    <FormControl>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        id="problemImageFile"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        onBlur={form.control._fields.problemImage?.ref?.onBlur} 
                        name={form.control._fields.problemImage?.ref?.name}
                      />
                    </FormControl>
                  </div>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Button 
            type="submit" 
            disabled={isLoading || (!problemTextValue?.trim() && (!problemImageValue || problemImageValue.length === 0))} 
            className="w-full text-lg py-3 md:py-4"
        >
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
