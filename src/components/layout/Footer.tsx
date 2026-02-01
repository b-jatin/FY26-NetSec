import Link from 'next/link';
import { Linkedin, Github, Mail } from 'lucide-react';

export function Footer(): JSX.Element {
  return (
    <footer className="border-t mt-auto py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-lg font-semibold">Contact Us</h3>
          <div className="flex items-center gap-6">
            <Link
              href="https://www.linkedin.com/in/jatin-bhandari/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="h-6 w-6" />
            </Link>
            <Link
              href="https://github.com/b-jatin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="GitHub Profile"
            >
              <Github className="h-6 w-6" />
            </Link>
            <Link
              href="mailto:jatin.bhandari@sjsu.edu"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Email"
            >
              <Mail className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
