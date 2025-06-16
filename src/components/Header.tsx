import Link from 'next/link';
import { NotebookText } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-headline font-bold text-primary">
          StepWise Solver
        </Link>
        <nav>
          <Link href="/gallery" legacyBehavior>
            <a className="flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium">
              <NotebookText size={20} />
              Problem Gallery
            </a>
          </Link>
        </nav>
      </div>
    </header>
  );
}
