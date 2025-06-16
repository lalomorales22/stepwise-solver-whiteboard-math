import { Header } from '@/components/Header';
import GalleryClientPage from '@/components/GalleryClientPage';

export default function GalleryPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-headline font-bold mb-6 text-primary border-b pb-2">
          Problem Gallery
        </h1>
        <GalleryClientPage />
      </main>
      <footer className="text-center py-4 border-t text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} StepWise Solver. All rights reserved.</p>
      </footer>
    </div>
  );
}
