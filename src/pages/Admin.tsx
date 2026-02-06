import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '@/contexts/LibraryContext';
import { Book } from '@/types/library';
import { AdminBookForm } from '@/components/admin/AdminBookForm';
import { LoanTable } from '@/components/admin/LoanTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Library,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Lock,
  LayoutDashboard,
  History,
  BookMarked,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ADMIN_PIN = '1234'; // Hardcoded PIN - replace with proper auth later

export default function Admin() {
  const navigate = useNavigate();
  const { books, addBook, updateBook, deleteBook, getActiveLoans, getReturnedLoans } = useLibrary();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  
  const [bookFormOpen, setBookFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // Check session storage for auth
  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setPinError(false);
      toast({
        title: 'Login berhasil',
        description: 'Selamat datang di panel admin.',
      });
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    setPinInput('');
  };

  const handleAddBook = () => {
    setEditingBook(null);
    setBookFormOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setBookFormOpen(true);
  };

  const handleDeleteClick = (book: Book) => {
    setBookToDelete(book);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (bookToDelete) {
      await deleteBook(bookToDelete.id);
      toast({
        title: 'Buku dihapus',
        description: `"${bookToDelete.title}" telah dihapus dari katalog.`,
      });
      setDeleteConfirmOpen(false);
      setBookToDelete(null);
    }
  };

  const handleSaveBook = async (bookData: Omit<Book, 'id' | 'status'>) => {
    await addBook(bookData);
  };

  const handleUpdateBook = async (id: string, bookData: Partial<Book>) => {
    await updateBook(id, bookData);
  };

  const activeLoans = getActiveLoans();
  const returnedLoans = getReturnedLoans();

  // PIN Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-2">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Masukkan PIN untuk mengakses panel admin</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="PIN = 1234"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  className={pinError ? 'border-destructive' : ''}
                  maxLength={10}
                />
                {pinError && (
                  <p className="text-sm text-destructive mt-1">PIN salah. Coba lagi.</p>
                )}
              </div>
              <Button type="submit" className="w-full">
                Masuk
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Beranda
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin Panel
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                <Library className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Admin Panel</h1>
                <p className="text-xs text-muted-foreground">e-Library Sekolah</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Beranda
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="books" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="books" className="flex items-center gap-2">
              <BookMarked className="h-4 w-4" />
              Buku
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Aktif ({activeLoans.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Riwayat
            </TabsTrigger>
          </TabsList>

          {/* Books Management Tab */}
          <TabsContent value="books" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Manajemen Buku</h2>
                <p className="text-sm text-muted-foreground">
                  Total: {books.length} buku
                </p>
              </div>
              <Button onClick={handleAddBook}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Buku
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Buku</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>ISBN</TableHead>
                        <TableHead>Stok</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {books.map((book) => (
                        <TableRow key={book.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-14 rounded overflow-hidden bg-muted flex-shrink-0">
                                {book.cover_url ? (
                                  <img
                                    src={book.cover_url}
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <BookOpen className="h-4 w-4 text-muted-foreground/50" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium line-clamp-1">{book.title}</p>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {book.author}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{book.category}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {book.isbn || '-'}
                          </TableCell>
                          <TableCell className="font-medium">{book.stock}</TableCell>
                          <TableCell>
                            <Badge
                              variant={book.stock > 0 ? 'default' : 'destructive'}
                              className={book.stock > 0 ? 'bg-primary' : ''}
                            >
                              {book.stock > 0 ? 'Tersedia' : 'Kosong'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditBook(book)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(book)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Loans Tab */}
          <TabsContent value="active">
            <LoanTable
              loans={activeLoans}
              title="Peminjaman Aktif"
              description="Daftar buku yang sedang dipinjam oleh siswa"
              emptyMessage="Tidak ada peminjaman aktif saat ini"
            />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <LoanTable
              loans={returnedLoans}
              title="Riwayat Pengembalian"
              description="Daftar buku yang telah dikembalikan"
              showReturnDate
              emptyMessage="Belum ada riwayat pengembalian"
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Book Form Modal */}
      <AdminBookForm
        book={editingBook}
        open={bookFormOpen}
        onOpenChange={setBookFormOpen}
        onSave={handleSaveBook}
        onUpdate={handleUpdateBook}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Buku?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus "{bookToDelete?.title}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
