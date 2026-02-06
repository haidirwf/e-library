import { useState, useEffect } from 'react';
import { Book } from '@/types/library';
import { BOOK_CATEGORIES } from '@/types/library';
import { searchByISBN, searchGoogleBooks, extractBookData } from '@/lib/googleBooks';
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
import { Search, Loader2, BookOpen } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  }, [book, open]);

  const handleGoogleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Query pencarian kosong',
        description: 'Masukkan ISBN atau judul buku untuk mencari.',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    try {
      // Try ISBN search first
      let result = await searchByISBN(searchQuery.trim());
      
      // If no result, try title search
      if (!result) {
        const results = await searchGoogleBooks(searchQuery.trim());
        result = results[0] || null;
      }

      if (result) {
        const bookData = extractBookData(result);
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
        toast({
          title: 'Data buku ditemukan! 📚',
          description: `"${bookData.title}" berhasil diambil dari Google Books.`,
        });
      } else {
        toast({
          title: 'Buku tidak ditemukan',
          description: 'Tidak ada hasil dari Google Books. Coba dengan kata kunci lain.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Gagal mencari buku',
        description: 'Terjadi kesalahan saat mengakses Google Books API.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.author.trim()) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Judul dan penulis wajib diisi.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && book && onUpdate) {
        await onUpdate(book.id, formData);
        toast({
          title: 'Buku berhasil diperbarui! ✅',
          description: `Data "${formData.title}" telah disimpan.`,
        });
      } else {
        await onSave(formData);
        toast({
          title: 'Buku berhasil ditambahkan! 📚',
          description: `"${formData.title}" telah ditambahkan ke katalog.`,
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Gagal menyimpan buku',
        description: 'Terjadi kesalahan saat menyimpan data buku.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Buku' : 'Tambah Buku Baru'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Perbarui informasi buku di bawah ini.'
              : 'Isi data buku atau cari dari Google Books.'}
          </DialogDescription>
        </DialogHeader>

        {/* Google Books Search */}
        {!isEditing && (
          <div className="border rounded-lg p-4 bg-muted/50">
            <Label className="text-sm font-medium flex items-center gap-2 mb-2">
              <Search className="h-4 w-4" />
              Cari di Google Books
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Masukkan ISBN atau judul buku..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGoogleSearch()}
              />
              <Button
                type="button"
                onClick={handleGoogleSearch}
                disabled={isSearching}
                variant="secondary"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Data akan otomatis terisi jika ditemukan
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-[120px,1fr] gap-4">
            {/* Cover Preview */}
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              {formData.cover_url ? (
                <img
                  src={formData.cover_url}
                  alt="Cover"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <BookOpen className="h-10 w-10 text-muted-foreground/50" />
              )}
            </div>

            {/* Main Fields */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="title">Judul Buku *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="author">Penulis *</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cover_url">URL Cover</Label>
                <Input
                  id="cover_url"
                  type="url"
                  placeholder="https://..."
                  value={formData.cover_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cover_url: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="publisher">Penerbit</Label>
              <Input
                id="publisher"
                value={formData.publisher}
                onChange={(e) => setFormData((prev) => ({ ...prev, publisher: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => setFormData((prev) => ({ ...prev, isbn: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="year">Tahun Terbit</Label>
              <Input
                id="year"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={formData.year}
                onChange={(e) => setFormData((prev) => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
              />
            </div>
            <div>
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BOOK_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="stock">Jumlah Stok</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData((prev) => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Buku'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
