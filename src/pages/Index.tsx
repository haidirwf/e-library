import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import {
  Search,
  LayoutGrid,
  Settings,
  User,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Index() {
  const { books, booksLoading } = useLibrary();

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'catalog' | 'return'>('catalog');

  const filteredBooks = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return books.filter(
      (b) =>
        (b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q)) &&
        (categoryFilter === 'all' || b.category === categoryFilter)
    );
  }, [books, searchQuery, categoryFilter]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* TOP NAV & TAB SWITCHER */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between md:h-20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
                <LayoutGrid className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg md:text-xl hidden sm:inline">Perpustakaan.</span>
            </div>

            {/* TAB SWITCHER DI TENAH (DESKTOP & MOBILE) */}
            <div className="bg-slate-100 p-1 rounded-full flex items-center">
              {[
                { id: 'catalog', label: 'Katalog', icon: BookOpen },
                { id: 'return', label: 'Kembali', icon: RotateCcw }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="relative px-4 py-1.5 text-xs md:text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  {activeTab === tab.id && (
                    <motion.span
                      layoutId="tab-indicator"
                      className="absolute inset-0 bg-white rounded-full shadow-sm"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 flex items-center gap-1.5 ${activeTab === tab.id ? 'text-primary' : 'text-slate-500'}`}>
                    <tab.icon className="h-3.5 w-3.5 md:hidden" />
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>

            <Link to="/admin">
              <Button variant="ghost" size="icon" className="rounded-full md:hidden">
                <Settings className="h-5 w-5 text-slate-600" />
              </Button>
              <Button variant="outline" className="hidden md:flex rounded-full gap-2">
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-10">
        <AnimatePresence mode="wait">
          {activeTab === 'catalog' ? (
            <motion.div
              key="catalog"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* SEARCH & FILTER BAR */}
              <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold md:text-3xl">Koleksi Buku</h2>
                  <p className="text-slate-500 text-sm">Temukan bacaan favoritmu hari ini.</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      className="pl-10 h-11 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary"
                      placeholder="Cari buku..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[120px] md:w-[160px] h-11 rounded-2xl bg-slate-50 border-none">
                      <SelectValue placeholder="Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      {BOOK_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* GRID */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {booksLoading
                  ? [...Array(12)].map((_, i) => (
                      <div key={i} className="animate-pulse space-y-3">
                        <div className="aspect-[3/4] bg-slate-100 rounded-2xl" />
                        <div className="h-4 bg-slate-100 rounded w-3/4" />
                      </div>
                    ))
                  : filteredBooks.map((book) => (
                      <motion.div
                        key={book.id}
                        whileHover={{ y: -6 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        onClick={() => {
                          setSelectedBook(book);
                          setModalOpen(true);
                        }}
                        className="group cursor-pointer"
                      >
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-slate-100 shadow-sm transition-shadow group-hover:shadow-md mb-3">
  <BookCard 
    book={book} 
    onClick={() => {
      setSelectedBook(book);
      setModalOpen(true);
    }} 
  />
</div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 px-2 py-0.5 rounded">
                            {book.category}
                          </span>
                          <h3 className="text-sm font-bold line-clamp-1 group-hover:text-primary transition-colors">
                            {book.title}
                          </h3>
                          <p className="text-[12px] text-slate-500 truncate">{book.author}</p>
                        </div>
                      </motion.div>
                    ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="return"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="max-w-xl mx-auto pt-4"
            >
              <div className="bg-white border rounded-[2rem] p-8 shadow-sm">

                <ReturnChecker />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BookDetailModal
        book={selectedBook}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}