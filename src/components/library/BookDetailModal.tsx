import { useState } from 'react';
import { Book } from '@/types/library';
import { useLibrary } from '@/contexts/LibraryContext';
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
import { Badge } from '@/components/ui/badge';
import { BookOpen, User, GraduationCap, IdCard, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BookDetailModalProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookDetailModal({ book, open, onOpenChange }: BookDetailModalProps) {
  const { createLoan } = useLibrary();
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [formData, setFormData] = useState({
    student_name: '',
    student_class: '',
    student_nis: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!book) return null;

  const isAvailable = book.stock > 0;

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.student_name.trim() || !formData.student_class.trim() || !formData.student_nis.trim()) {
      toast({
        title: 'Form tidak lengkap',
        description: 'Mohon lengkapi semua field yang diperlukan.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createLoan({
        book_id: book.id,
        student_name: formData.student_name.trim(),
        student_class: formData.student_class.trim(),
        student_nis: formData.student_nis.trim(),
        borrow_date: new Date().toISOString().split('T')[0],
      });

      toast({
        title: 'Buku berhasil dipinjam! 📚',
        description: `${book.title} telah dipinjam oleh ${formData.student_name}.`,
      });

      setFormData({ student_name: '', student_class: '', student_nis: '' });
      setShowBorrowForm(false);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Gagal meminjam buku',
        description: 'Terjadi kesalahan saat memproses peminjaman.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowBorrowForm(false);
    setFormData({ student_name: '', student_class: '', student_nis: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{book.title}</DialogTitle>
          <DialogDescription>oleh {book.author}</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-[200px,1fr] gap-6 mt-4">
          {/* Book Cover */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`absolute inset-0 flex items-center justify-center bg-muted ${book.cover_url ? 'hidden' : ''}`}>
              <BookOpen className="h-16 w-16 text-muted-foreground/50" />
            </div>
          </div>

          {/* Book Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge
                variant={isAvailable ? 'default' : 'destructive'}
                className={isAvailable ? 'bg-primary' : ''}
              >
                {isAvailable ? `Tersedia (${book.stock} buku)` : 'Tidak Tersedia'}
              </Badge>
              <Badge variant="secondary">{book.category}</Badge>
            </div>

            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Penerbit:</span> {book.publisher}</p>
              <p><span className="font-medium">Tahun:</span> {book.year}</p>
              <p><span className="font-medium">ISBN:</span> {book.isbn || '-'}</p>
            </div>

            {book.description && (
              <div>
                <h4 className="font-medium mb-1">Deskripsi</h4>
                <p className="text-sm text-muted-foreground line-clamp-4">{book.description}</p>
              </div>
            )}

            {!showBorrowForm ? (
              <Button
                onClick={() => setShowBorrowForm(true)}
                disabled={!isAvailable}
                className="w-full"
                size="lg"
              >
                {isAvailable ? 'Pinjam Buku Ini' : 'Stok Habis'}
              </Button>
            ) : (
              <form onSubmit={handleBorrow} className="space-y-4 border-t pt-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Form Peminjaman
                </h4>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="student_name" className="flex items-center gap-2">
                      <User className="h-3 w-3" /> Nama Lengkap
                    </Label>
                    <Input
                      id="student_name"
                      placeholder="Masukkan nama lengkap"
                      value={formData.student_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, student_name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="student_class" className="flex items-center gap-2">
                      <GraduationCap className="h-3 w-3" /> Kelas
                    </Label>
                    <Input
                      id="student_class"
                      placeholder="Contoh: XII IPA 1"
                      value={formData.student_class}
                      onChange={(e) => setFormData((prev) => ({ ...prev, student_class: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="student_nis" className="flex items-center gap-2">
                      <IdCard className="h-3 w-3" /> NIS (Nomor Induk Siswa)
                    </Label>
                    <Input
                      id="student_nis"
                      placeholder="Masukkan NIS"
                      value={formData.student_nis}
                      onChange={(e) => setFormData((prev) => ({ ...prev, student_nis: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowBorrowForm(false)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? 'Memproses...' : 'Konfirmasi Pinjam'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
