import { useState, useMemo } from 'react';
import { useLibrary } from '@/contexts/LibraryContext';
import { Book } from '@/types/library';
import { BOOK_CATEGORIES } from '@/types/library';
import { BookCard } from '@/components/library/BookCard';
import { BookDetailModal } from '@/components/library/BookDetailModal';
import { ReturnChecker } from '@/components/library/ReturnChecker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, LayoutGrid, Settings, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Index() {
  const { books, booksLoading } = useLibrary();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('catalog');

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [books, searchQuery, categoryFilter]);

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center">
                <LayoutGrid className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">Perpustakaan.</span>
            </div>
            
            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-full">
              <button 
                onClick={() => setActiveTab('catalog')}
                className={`px-6 py-1.5 text-xs font-semibold rounded-full transition-all ${activeTab === 'catalog' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Katalog
              </button>
              <button 
                onClick={() => setActiveTab('return')}
                className={`px-6 py-1.5 text-xs font-semibold rounded-full transition-all ${activeTab === 'return' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Pengembalian
              </button>
            </div>
          </div>

          <Link to="/admin">
            <Button variant="outline" className="rounded-full border-slate-200 hover:border-primary hover:text-primary transition-all gap-2">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium hidden sm:inline">Admin Panel</span>
            </Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {activeTab === 'catalog' ? (
          <div className="animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
              <div>
                <h2 className="text-4xl font-bold tracking-tight mb-3">Koleksi Buku</h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative group flex-1 md:min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Cari judul atau penulis..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white shadow-none"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-44 h-11 border-slate-200 rounded-xl bg-slate-50/50 shadow-none">
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="all">Semua Genre</SelectItem>
                    {BOOK_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Book Grid */}
            {booksLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="space-y-3 animate-pulse">
                    <div className="aspect-[3/4] bg-slate-100 rounded-2xl" />
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="py-32 text-center border-2 border-dashed rounded-3xl border-slate-100">
                <p className="text-slate-400 font-medium">Buku tidak ditemukan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
                {filteredBooks.map((book) => (
                  <div 
  key={book.id} 
  className="group cursor-pointer flex flex-col"
  onClick={() => handleBookClick(book)}
>
                    <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/10 group-hover:border-primary/20">
    <BookCard book={book} onClick={handleBookClick} /> 
  </div>
                    
                    <div className="space-y-1 px-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 px-2 py-0.5 rounded">
                        {book.category}
                      </span>
                      <h3 className="font-bold text-sm leading-tight text-slate-800 line-clamp-2 group-hover:text-primary transition-colors">
                        {book.title}
                      </h3>
                      <div className="flex items-center gap-1 text-slate-500">
                        <User className="h-3 w-3 shrink-0" />
                        <p className="text-xs truncate">{book.author}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Return Section */
          <div className="max-w-2xl mx-auto pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Cek Pengembalian</h2>
              <p className="text-slate-500">Daftar buku yang sedang dipinjam.</p>
            </div>
            <div className="bg-white border rounded-3xl p-8 shadow-sm">
              <ReturnChecker />
            </div>
          </div>
        )}
      </main>

      <BookDetailModal
        book={selectedBook}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}