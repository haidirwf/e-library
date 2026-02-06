import { Book } from '@/types/library';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onClick: (book: Book) => void;
}

export function BookCard({ book, onClick }: BookCardProps) {
  const isAvailable = book.stock > 0;

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      onClick={() => onClick(book)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center bg-muted ${book.cover_url ? 'hidden' : ''}`}>
          <BookOpen className="h-16 w-16 text-muted-foreground/50" />
        </div>
        <div className="absolute top-2 right-2">
          <Badge
            variant={isAvailable ? 'default' : 'destructive'}
            className={isAvailable ? 'bg-primary hover:bg-primary/90' : ''}
          >
            {isAvailable ? `Tersedia (${book.stock})` : 'Kosong'}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
        <Badge variant="secondary" className="mt-2 text-xs">
          {book.category}
        </Badge>
      </CardContent>
    </Card>
  );
}
