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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, User, GraduationCap, IdCard, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BookDetailModalProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Daftar kelas sesuai permintaan
const CLASS_OPTIONS = [
  "7 SMP",
  "8 SMP",
  "9 SMP",
  "10 TKJ",
  "10 RPL",
  "11 TKJ",
  "11 RPL",
];

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
    
    if (!formData.student_name.trim() || !formData.student_class || !formData.student_nis.trim()) {
      toast({
        title: 'Form tidak lengkap',
        description: 'Mohon lengkapi semua field termasuk pilihan kelas.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createLoan({
        book_id: book.id,
        student_name: formData.student_name.trim(),
        student_class: formData.student_class,
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
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted shadow-inner border">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : null}
            <div className={`absolute inset-0 flex items-center justify-center bg-muted`}>
              <BookOpen className="h-16 w-16 text-muted-foreground/30" />
            </div>
          </div>

          {/* Book Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge
                variant={isAvailable ? 'default' : 'destructive'}
                className={isAvailable ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {isAvailable ? `Tersedia (${book.stock} buku)` : 'Stok Habis'}
              </Badge>
              <Badge variant="outline">{book.category}</Badge>
            </div>

            <div className="space-y-1 text-sm border-b pb-3">
              <p><span className="text-muted-foreground">Penerbit:</span> {book.publisher}</p>
              <p><span className="text-muted-foreground">Tahun:</span> {book.year}</p>
              <p><span className="text-muted-foreground">ISBN:</span> {book.isbn || '-'}</p>
            </div>

            {book.description && (
              <div>
                <h4 className="text-sm font-semibold mb-1">Deskripsi</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {book.description}
                </p>
              </div>
            )}

            {!showBorrowForm ? (
              <Button
                onClick={() => setShowBorrowForm(true)}
                disabled={!isAvailable}
                className="w-full"
                size="lg"
              >
                {isAvailable ? 'Pinjam Sekarang' : 'Tidak Bisa Dipinjam'}
              </Button>
            ) : (
              <form onSubmit={handleBorrow} className="space-y-4 bg-muted/30 p-4 rounded-lg border">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Informasi Peminjam
                </h4>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="student_name" className="text-xs">Nama Lengkap</Label>
                    <Input
                      id="student_name"
                      placeholder="Nama sesuai absen"
                      value={formData.student_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, student_name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="student_class" className="text-xs">Kelas</Label>
                    <Select
                      value={formData.student_class}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, student_class: value }))}
                    >
                      <SelectTrigger id="student_class">
                        <SelectValue placeholder="Pilih Kelas" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASS_OPTIONS.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="student_nis" className="text-xs">NIS (Nomor Induk Siswa)</Label>
                    <Input
                      id="student_nis"
                      placeholder="Masukkan NIS"
                      value={formData.student_nis}
                      onChange={(e) => setFormData((prev) => ({ ...prev, student_nis: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowBorrowForm(false)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? 'Memproses...' : 'Konfirmasi'}
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