import { useState, useEffect, useRef } from 'react';
import { Book } from '@/types/library';
import { BOOK_CATEGORIES } from '@/types/library';
import { searchGoogleBooks, extractBookData } from '@/lib/googleBooks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Loader2, BookOpen, X, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AdminBookFormProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (book: Omit<Book, 'id' | 'status'>) => Promise<void>;
  onUpdate?: (id: string, book: Partial<Book>) => Promise<void>;
}

const initialFormData = {
  title: '',
  author: '',
  publisher: '',
  year: new Date().getFullYear(),
  category: 'Lainnya',
  description: '',
  cover_url: '',
  isbn: '',
  stock: 1,
};

export function AdminBookForm({ book, open, onOpenChange, onSave, onUpdate }: AdminBookFormProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  const isEditing = !!book;

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        year: book.year,
        category: book.category,
        description: book.description,
        cover_url: book.cover_url,
        isbn: book.isbn,
        stock: book.stock,
      });
    } else {
      setFormData(initialFormData);
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  }, [book, open]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGoogleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Query kosong',
        description: 'Masukkan judul atau ISBN.',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchGoogleBooks(searchQuery.trim());
      if (results && results.length > 0) {
        setSearchResults(results);
        setShowSearchResults(true);
      } else {
        toast({
          title: 'Tidak ditemukan',
          description: 'Coba kata kunci lain.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Gagal mencari',
        description: 'Terjadi kesalahan pada server Google Books.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectBook = (rawBook: any) => {
    const bookData = extractBookData(rawBook);
    setFormData((prev) => ({
      ...prev,
      title: bookData.title || prev.title,
      author: bookData.author || prev.author,
      publisher: bookData.publisher || prev.publisher,
      year: bookData.year || prev.year,
      description: bookData.description || prev.description,
      cover_url: bookData.cover_url || prev.cover_url,
      isbn: bookData.isbn || prev.isbn,
      category: BOOK_CATEGORIES.includes(bookData.category as any) 
        ? bookData.category 
        : prev.category,
    }));
    setSearchResults([]);
    setSearchQuery('');
    setShowSearchResults(false);
    toast({
      title: 'Data Terpilih',
      description: `Berhasil memuat data "${bookData.title}"`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.author.trim()) {
      toast({ 
        title: 'Data tidak lengkap', 
        description: 'Judul dan penulis wajib diisi',
        variant: 'destructive' 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && book && onUpdate) {
        await onUpdate(book.id, formData);
        toast({
          title: 'Berhasil',
          description: 'Data buku berhasil diperbarui',
        });
      } else {
        await onSave(formData);
        toast({
          title: 'Berhasil',
          description: 'Buku baru berhasil ditambahkan',
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({ 
        title: 'Gagal menyimpan', 
        description: 'Silakan coba lagi',
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] sm:h-[85vh] md:h-[80vh] p-0 overflow-hidden">
        <div className="p-4 sm:p-1000 pb-0">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <DialogTitle className="text-lg sm:text-xl">
                  {isEditing ? 'Edit Buku' : 'Tambah Buku Baru'}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  {isEditing ? 'Perbarui informasi buku.' : 'Cari otomatis atau isi manual.'}
                </DialogDescription>
              </div>
              
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="flex-1 px-4 sm:px-6 pt-2">
          {/* Google Books Search Section */}
          {!isEditing && (
            <div className="border rounded-lg p-3 sm:p-4 bg-muted/40 mb-4 sm:mb-6 space-y-3 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <Label className="text-sm font-medium text-foreground flex items-center gap-1.5">
  <Search className="h-3.5 w-3.5" />
  Quick Import Google Books
</Label>

              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="ISBN atau Judul..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGoogleSearch()}
                    className="bg-background pr-10"
                  />
                  {searchQuery && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                      onClick={() => {
                        setSearchQuery('');
                        setShowSearchResults(false);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={handleGoogleSearch}
                  disabled={isSearching}
                  variant="secondary"
                  className="sm:w-auto"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Cari</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Search Results Dropdown - Responsive */}
              {showSearchResults && searchResults.length > 0 && (
                <div 
                  ref={searchResultsRef}
                  className="absolute z-50 left-0 right-0 sm:left-4 sm:right-4 mt-1 border rounded-md bg-background shadow-xl max-h-[280px] sm:max-h-[320px] overflow-y-auto divide-y animate-in fade-in zoom-in-95"
                >
                  <div className="p-2 bg-muted/20 flex justify-between items-center sticky top-0 backdrop-blur-sm z-10">
                    <span className="text-[10px] font-bold text-muted-foreground ml-2">
                      {searchResults.length} hasil ditemukan
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => setShowSearchResults(false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  {searchResults.map((result, idx) => {
                    const data = extractBookData(result);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectBook(result)}
                        className="w-full text-left p-3 hover:bg-accent flex gap-3 transition-colors items-start border-b last:border-b-0"
                      >
                        <div className="w-10 h-14 sm:w-12 sm:h-16 bg-muted rounded shrink-0 overflow-hidden border">
                          {data.cover_url ? (
                            <img 
                              src={data.cover_url} 
                              alt="" 
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-6 h-6 p-1 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate leading-tight">{data.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {data.author || 'Penulis tidak dikenal'}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1 opacity-70 truncate">
                            {data.publisher} {data.year ? `(${data.year})` : ''}
                          </p>
                          {data.isbn && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              ISBN: {data.isbn}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <form id="book-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Cover & Basic Info - Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-[140px,1fr] gap-4 sm:gap-6">
              {/* Cover Preview - Responsive */}
              <div className="space-y-2 order-2 md:order-1">
                <Label className="flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Cover Buku
                </Label>
                <div className="aspect-[3/4] max-w-[140px] mx-auto md:mx-0 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden relative group transition-all hover:border-primary/50">
                  {formData.cover_url ? (
                    <>
                      <img
                        src={formData.cover_url}
                        alt="Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 h-7 w-7 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                              onClick={() => setFormData(p => ({ ...p, cover_url: '' }))}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Hapus cover</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/50 mb-2" />
                      <p className="text-xs text-muted-foreground/70">Tidak ada cover</p>
                    </div>
                  )}
                </div>
                <div className="text-center md:text-left">
                  <Input
                    value={formData.cover_url}
                    onChange={(e) => setFormData(p => ({ ...p, cover_url: e.target.value }))}
                    placeholder="https://..."
                    className="text-xs h-8"
                  />
                </div>
              </div>

              {/* Core Info - Responsive */}
              <div className="space-y-3 sm:space-y-4 order-1 md:order-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="title" className="flex items-center gap-1.5">
                    Judul Buku <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                    placeholder="Contoh: Laskar Pelangi"
                    required
                    className="h-10 sm:h-11"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="author" className="flex items-center gap-1.5">
                    Penulis <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData(p => ({ ...p, author: e.target.value }))}
                    placeholder="Nama penulis..."
                    required
                    className="h-10 sm:h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input
                      id="isbn"
                      value={formData.isbn}
                      onChange={(e) => setFormData(p => ({ ...p, isbn: e.target.value }))}
                      placeholder="978-..."
                      className="h-10 sm:h-11"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="publisher">Penerbit</Label>
                    <Input
                      id="publisher"
                      value={formData.publisher}
                      onChange={(e) => setFormData(p => ({ ...p, publisher: e.target.value }))}
                      placeholder="Nama penerbit..."
                      className="h-10 sm:h-11"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Responsive untuk Tahun, Kategori, Stok */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="year">Tahun Terbit</Label>
                <Input
                  id="year"
                  type="number"
                  min="0"
                  max={new Date().getFullYear() + 5}
                  value={formData.year}
                  onChange={(e) => setFormData(p => ({ ...p, year: parseInt(e.target.value) || 0 }))}
                  className="h-10 sm:h-11"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}
                >
                  <SelectTrigger className="h-10 sm:h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOK_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-sm">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="stock">Jumlah Stok</Label>
                <div className="relative">
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={(e) => setFormData(p => ({ ...p, stock: parseInt(e.target.value) || 0 }))}
                    className="h-10 sm:h-11 pr-10"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                    buku
                  </div>
                </div>
              </div>
            </div>

            {/* Deskripsi - Full Width */}
            <div className="grid gap-1.5">
              <Label htmlFor="description">Deskripsi Buku</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                rows={3}
                className="min-h-[100px] resize-y"
                placeholder="Masukkan deskripsi singkat tentang buku..."
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.description.length}/500 karakter
              </p>
            </div>
          </form>
        </ScrollArea>

        {/* Footer Buttons - Responsive */}
        <div className="p-4 sm:p-6 border-t bg-muted/20 flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="order-2 sm:order-1 sm:flex-1"
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="book-form"
            disabled={isSubmitting}
            className="order-1 sm:order-2 sm:flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : isEditing ? (
              'Simpan Perubahan'
            ) : (
              'Tambah Buku'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}