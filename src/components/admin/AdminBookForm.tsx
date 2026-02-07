import { useState, useEffect } from 'react';
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
import { Search, Loader2, BookOpen, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  }, [book, open]);

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
    toast({
      title: 'Data Terpilih',
      description: `Berhasil memuat data "${bookData.title}"`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.author.trim()) {
      toast({ title: 'Data tidak lengkap', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && book && onUpdate) {
        await onUpdate(book.id, formData);
      } else {
        await onSave(formData);
      }
      onOpenChange(false);
    } catch (error) {
      toast({ title: 'Gagal menyimpan', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Buku' : 'Tambah Buku Baru'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Perbarui informasi buku.' : 'Cari otomatis atau isi manual.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="flex-1 p-6 pt-2">
          {/* Google Books Search Section */}
          {!isEditing && (
            <div className="border rounded-lg p-4 bg-muted/40 mb-6 space-y-3 relative">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Search className="h-3 w-3" />
                Quick Import (Google Books)
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="ISBN atau Judul..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGoogleSearch()}
                  className="bg-background"
                />
                <Button
                  type="button"
                  onClick={handleGoogleSearch}
                  disabled={isSearching}
                  variant="secondary"
                >
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cari'}
                </Button>
              </div>

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute z-50 left-4 right-4 mt-1 border rounded-md bg-background shadow-xl max-h-[250px] overflow-y-auto divide-y animate-in fade-in zoom-in-95">
                  <div className="p-2 bg-muted/20 flex justify-between items-center sticky top-0 backdrop-blur-sm">
                    <span className="text-[10px] font-bold text-muted-foreground ml-2">HASIL PENCARIAN</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSearchResults([])}>
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
                        className="w-full text-left p-3 hover:bg-accent flex gap-3 transition-colors items-start"
                      >
                        <div className="w-10 h-14 bg-muted rounded shrink-0 overflow-hidden border">
                          {data.cover_url ? (
                            <img src={data.cover_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <BookOpen className="w-full h-full p-2 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate leading-tight">{data.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{data.author || 'Penulis tidak dikenal'}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 opacity-70">
                            {data.publisher} {data.year ? `(${data.year})` : ''}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <form id="book-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-[140px,1fr] gap-6">
              {/* Cover Preview */}
              <div className="space-y-2">
                <Label>Cover</Label>
                <div className="aspect-[3/4] rounded-lg border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden relative group">
                  {formData.cover_url ? (
                    <img
                      src={formData.cover_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                  )}
                </div>
              </div>

              {/* Core Info */}
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Judul Buku *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                    placeholder="Contoh: Laskar Pelangi"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="author">Penulis *</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData(p => ({ ...p, author: e.target.value }))}
                    placeholder="Nama penulis..."
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cover_url">URL Gambar Cover</Label>
                  <Input
                    id="cover_url"
                    value={formData.cover_url}
                    onChange={(e) => setFormData(p => ({ ...p, cover_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="publisher">Penerbit</Label>
                <Input
                  id="publisher"
                  value={formData.publisher}
                  onChange={(e) => setFormData(p => ({ ...p, publisher: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  value={formData.isbn}
                  onChange={(e) => setFormData(p => ({ ...p, isbn: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="year">Tahun</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData(p => ({ ...p, year: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOK_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stok</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData(p => ({ ...p, stock: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                rows={4}
              />
            </div>
          </form>
        </ScrollArea>

        <div className="p-6 border-t bg-muted/20 flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Batal
          </Button>
          <Button type="submit" form="book-form" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Buku'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}