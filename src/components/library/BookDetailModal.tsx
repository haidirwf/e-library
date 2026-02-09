import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { BookOpen, Calendar, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BookDetailModalProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CLASS_OPTIONS = ["7 SMP", "8 SMP", "9 SMP", "10 TKJ", "10 RPL", "11 TKJ", "11 RPL"];

export function BookDetailModal({ book, open, onOpenChange }: BookDetailModalProps) {
  const { createLoan } = useLibrary();
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [isOpeningForm, setIsOpeningForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    student_name: '',
    student_class: '',
    student_nis: '',
  });

  if (!book) return null;

  const isAvailable = book.stock > 0;

  const handleNisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setFormData(prev => ({ ...prev, student_nis: value }));
    }
  };

  const handleShowForm = () => {
    setIsOpeningForm(true);
    setTimeout(() => {
      setShowBorrowForm(true);
      setIsOpeningForm(false);
    }, 1000);
  };

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.student_nis.length < 4) {
      toast({
        title: 'NIS Tidak Valid',
        description: 'NIS minimal terdiri dari 4 digit angka.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await createLoan({
        book_id: book.id,
        student_name: formData.student_name.trim(),
        student_class: formData.student_class,
        student_nis: formData.student_nis,
        borrow_date: new Date().toISOString().split('T')[0],
      });

      toast({
        title: 'Berhasil! 📚',
        description: `${book.title} dipinjam oleh ${formData.student_name}.`,
      });
      handleClose();
    } catch (error) {
      toast({
        title: 'Gagal',
        description: 'Terjadi kesalahan saat memproses.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowBorrowForm(false);
    setIsOpeningForm(false);
    setFormData({ student_name: '', student_class: '', student_nis: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {/* max-w-[95vw] memastikan modal tidak mentok layar di HP */}
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-4 md:p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg md:text-xl line-clamp-2">{book.title}</DialogTitle>
          <DialogDescription className="text-xs md:text-sm">oleh {book.author}</DialogDescription>
        </DialogHeader>

        {/* Grid Responsive: 1 kolom di mobile, 2 kolom di tablet/desktop */}
        <div className="grid grid-cols-1 md:grid-cols-[200px,1fr] gap-6 mt-2 md:mt-4">
          
          {/* Bagian Cover (Full width di mobile) */}
          <div className="flex flex-col items-center md:items-start">
            <div className="relative w-full max-w-[160px] md:max-w-full aspect-[3/4] overflow-hidden rounded-lg bg-muted shadow-sm border">
              {book.cover_url ? (
                <img
                  src={book.cover_url.replace('http://', 'https://')} 
                  alt={book.title}
                  className="h-full w-full object-cover relative z-10"
                  referrerPolicy="no-referrer" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground/30 gap-2 text-center p-2">
                <BookOpen className="h-8 w-8" />
                <span className="text-[10px] font-medium uppercase leading-tight">No Cover Available</span>
              </div>
            </div>
          </div>

          {/* Bagian Detail & Form */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={isAvailable ? 'default' : 'destructive'} className={isAvailable ? 'bg-green-600' : ''}>
                {isAvailable ? `Tersedia (${book.stock})` : 'Habis'}
              </Badge>
              <Badge variant="outline" className="text-[10px] md:text-xs">{book.category}</Badge>
            </div>

            <div className="space-y-1 text-xs md:text-sm border-b pb-3 text-muted-foreground">
              <p>Penerbit: <span className="text-foreground">{book.publisher}</span></p>
              <p>ISBN: <span className="text-foreground">{book.isbn || '-'}</span></p>
            </div>

            <AnimatePresence mode="wait">
              {!showBorrowForm ? (
                <motion.div
                  key="action-button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {book.description && (
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {book.description}
                    </p>
                  )}
                  <Button
                    onClick={handleShowForm}
                    disabled={!isAvailable || isOpeningForm}
                    className="w-full h-11 md:h-12 text-sm font-semibold"
                  >
                    {isOpeningForm ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Menyiapkan...
                      </span>
                    ) : (
                      <motion.span whileTap={{ scale: 0.97 }}>
                        {isAvailable ? 'Pinjam Sekarang' : 'Stok Tidak Tersedia'}
                      </motion.span>
                    )}
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="borrow-form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onSubmit={handleBorrow}
                  className="space-y-4 bg-muted/30 p-3 md:p-4 rounded-xl border border-primary/10"
                >
                  <h4 className="font-bold text-xs md:text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Data Peminjam
                  </h4>

                  <div className="grid gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="student_name" className="text-[11px] md:text-xs">Nama Lengkap</Label>
                      <Input
                        id="student_name"
                        className="h-10 text-sm"
                        placeholder="Masukkan nama lengkap"
                        value={formData.student_name}
                        onChange={(e) => setFormData(p => ({ ...p, student_name: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="student_class" className="text-[11px] md:text-xs">Kelas</Label>
                        <Select
                          value={formData.student_class}
                          onValueChange={(val) => setFormData(p => ({ ...p, student_class: val }))}
                        >
                          <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
                          <SelectContent>
                            {CLASS_OPTIONS.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="student_nis" className="text-[11px] md:text-xs flex justify-between">
                          NIS
                          <span className="font-normal opacity-50">{formData.student_nis.length}/10</span>
                        </Label>
                        <Input
                          id="student_nis"
                          className="h-10 text-sm"
                          placeholder="Hanya angka"
                          value={formData.student_nis}
                          onChange={handleNisChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button type="submit" disabled={isSubmitting} className="w-full sm:order-2 h-10 text-sm">
                      {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Proses...</> : 'Konfirmasi'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setShowBorrowForm(false)} 
                      className="w-full sm:order-1 h-10 text-sm"
                      disabled={isSubmitting}
                    >
                      Batal
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}