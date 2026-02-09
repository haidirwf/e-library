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
    <div className="min-h-screen bg-white text-slate-900 pb-20 md:pb-0">
      {/* TOP NAV */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
        <div className="h-16 px-4 flex items-center justify-between max-w-7xl mx-auto md:h-20 md:px-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
              <LayoutGrid className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg md:text-xl">Perpustakaan.</span>
          </div>

          <Link to="/admin">
            <Button variant="outline" className="rounded-full gap-2">
              <Settings className="h-6 w-6" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          </Link>
        </div>
      </nav>

      {/* DESKTOP TAB */}
      <div className="hidden md:block border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="relative inline-flex bg-slate-100 p-1 rounded-full">
            {['catalog', 'return'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className="relative px-6 py-2 text-sm font-semibold z-10"
              >
                {activeTab === tab && (
                  <motion.span
                    layoutId="tab-indicator"
                    className="absolute inset-0 bg-white rounded-full shadow"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span
                  className={`relative ${
                    activeTab === tab
                      ? 'text-primary'
                      : 'text-slate-500'
                  }`}
                >
                  {tab === 'catalog' ? 'Katalog' : 'Pengembalian'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'catalog' ? (
            <motion.div
              key="catalog"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* HEADER */}
              <div className="flex flex-col gap-6 mb-6 md:flex-row md:items-end md:justify-between">
                <h2 className="text-2xl font-bold md:text-4xl">Koleksi Buku</h2>

                <div className="flex flex-col gap-3 w-full sm:flex-row">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      className="pl-10 h-11 rounded-xl"
                      placeholder="Cari judul atau penulis..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-full sm:w-44 h-11 rounded-xl">
                      <SelectValue placeholder="Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Genre</SelectItem>
                      {BOOK_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* GRID */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-5 xl:grid-cols-6">
                {booksLoading
                  ? [...Array(8)].map((_, i) => (
                      <div key={i} className="animate-pulse space-y-3">
                        <div className="aspect-[3/4] bg-slate-100 rounded-2xl" />
                        <div className="h-4 bg-slate-100 rounded" />
                      </div>
                    ))
                  : filteredBooks.map((book) => (
                      <motion.div
                        key={book.id}
                        whileHover={{ y: -4 }}
                        onClick={() => {
                          setSelectedBook(book);
                          setModalOpen(true);
                        }}
                        className="cursor-pointer"
                      >
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden border mb-3">
                          <BookCard
  book={book}
  onClick={() => {
    setSelectedBook(book);
    setModalOpen(true);
  }}
/>

                        </div>
                        <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {book.category}
                        </span>
                        <h3 className="text-xs sm:text-sm font-bold line-clamp-2">
                          {book.title}
                        </h3>
                        <div className="flex items-center gap-1 text-slate-500">
                          <User className="h-3 w-3" />
                          <p className="text-[11px] truncate">{book.author}</p>
                        </div>
                      </motion.div>
                    ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="return"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-2xl font-bold mb-4 text-center">
                Cek Pengembalian
              </h2>
              <div className="border rounded-3xl p-6">
                <ReturnChecker />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* MOBILE BOTTOM TAB */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
        <div className="grid grid-cols-2">
          {[
            { id: 'catalog', icon: BookOpen, label: 'Katalog' },
            { id: 'return', icon: RotateCcw, label: 'Return' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-3 flex flex-col items-center text-xs font-medium ${
                activeTab === t.id ? 'text-primary' : 'text-slate-400'
              }`}
            >
              <t.icon className="h-5 w-5 mb-1" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <BookDetailModal
        book={selectedBook}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
