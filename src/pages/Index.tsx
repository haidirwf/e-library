import { useState, useMemo } from 'react';
import { useLibrary } from '@/contexts/LibraryContext';
import { Book } from '@/types/library';
import { BOOK_CATEGORIES } from '@/types/library';
import { BookCard } from '@/components/library/BookCard';
import { BookDetailModal } from '@/components/library/BookDetailModal';
import { ReturnChecker } from '@/components/library/ReturnChecker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, Search, RotateCcw, Library, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Index() {
  const { books, booksLoading } = useLibrary();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn.includes(searchQuery);
      const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [books, searchQuery, categoryFilter]);

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                <Library className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">e-Library</h1>
                <p className="text-xs text-muted-foreground">Perpustakaan Digital Sekolah</p>
              </div>
            </div>
            <Link to="/admin">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="catalog" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="catalog" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Katalog Buku
            </TabsTrigger>
            <TabsTrigger value="return" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Pengembalian
            </TabsTrigger>
          </TabsList>

          {/* Catalog Tab */}
          <TabsContent value="catalog" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari judul, penulis, atau ISBN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {BOOK_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          {/* Results Info */}
            <div className="flex items-center gap-2">
              {booksLoading ? (
                <p className="text-sm text-muted-foreground">Memuat buku dari Google Books...</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Menampilkan {filteredBooks.length} dari {books.length} buku
                </p>
              )}
            </div>

            {/* Book Grid */}
            {filteredBooks.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  Tidak ada buku ditemukan
                </p>
                <p className="text-sm text-muted-foreground">
                  Coba ubah kata kunci atau filter pencarian
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredBooks.map((book) => (
                  <BookCard key={book.id} book={book} onClick={handleBookClick} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Return Tab */}
          <TabsContent value="return">
            <ReturnChecker />
          </TabsContent>
        </Tabs>
      </main>

      {/* Book Detail Modal */}
      <BookDetailModal
        book={selectedBook}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
