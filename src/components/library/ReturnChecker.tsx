import { useState } from 'react';
import { useLibrary } from '@/contexts/LibraryContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, RotateCcw, Calendar, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function ReturnChecker() {
  const { getLoansByNis, returnBook } = useLibrary();
  const [nis, setNis] = useState('');
  const [searchedNis, setSearchedNis] = useState('');
  const [isReturning, setIsReturning] = useState<string | null>(null);

  const loans = searchedNis ? getLoansByNis(searchedNis) : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis.trim()) {
      toast({
        title: 'NIS diperlukan',
        description: 'Mohon masukkan NIS untuk mencari peminjaman.',
        variant: 'destructive',
      });
      return;
    }
    setSearchedNis(nis.trim());
  };

  const handleReturn = async (loanId: string, bookId: string, bookTitle: string) => {
    setIsReturning(loanId);
    try {
      await returnBook(loanId, bookId);
      toast({
        title: 'Buku berhasil dikembalikan! ✅',
        description: `${bookTitle} telah dikembalikan ke perpustakaan.`,
      });
    } catch (error) {
      toast({
        title: 'Gagal mengembalikan buku',
        description: 'Terjadi kesalahan saat memproses pengembalian.',
        variant: 'destructive',
      });
    } finally {
      setIsReturning(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Cek Peminjaman
          </CardTitle>
          <CardDescription>
            Masukkan NIS untuk melihat daftar buku yang sedang dipinjam
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Masukkan NIS..."
              value={nis}
              onChange={(e) => setNis(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Cari
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {searchedNis && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Hasil pencarian untuk NIS: <span className="text-primary">{searchedNis}</span>
          </h3>

          {loans.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Tidak ada peminjaman aktif untuk NIS ini.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {loans.map((loan) => (
                <Card key={loan.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Book Cover */}
                      <div className="w-16 h-20 rounded overflow-hidden bg-muted flex-shrink-0">
                        {loan.book?.cover_url ? (
                          <img
                            src={loan.book.cover_url}
                            alt={loan.book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>

                      {/* Book Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold line-clamp-1">
                          {loan.book?.title || 'Buku tidak ditemukan'}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {loan.book?.author}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {loan.student_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Dipinjam: {new Date(loan.borrow_date).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <Badge variant="secondary" className="mt-2">
                          {loan.student_class}
                        </Badge>
                      </div>

                      {/* Return Button */}
                      <Button
                        onClick={() => handleReturn(loan.id, loan.book_id, loan.book?.title || 'Buku')}
                        disabled={isReturning === loan.id}
                        size="sm"
                        className="flex-shrink-0"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        {isReturning === loan.id ? 'Memproses...' : 'Kembalikan'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
