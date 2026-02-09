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
  LayoutGrid,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Lock,
  History,
  BookMarked,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ADMIN_PIN = '1234';

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

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setPinError(false);
      toast({ title: 'Akses Diterima', description: 'Selamat bekerja, Admin.' });
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
      toast({ title: 'Buku dihapus', description: `"${bookToDelete.title}" telah dihapus.` });
      setDeleteConfirmOpen(false);
      setBookToDelete(null);
    }
  };

  const handleSaveBook = async (bookData: Omit<Book, 'id' | 'status'>) => {
    await addBook(bookData);
    setBookFormOpen(false);
  };

  const handleUpdateBook = async (id: string, bookData: Partial<Book>) => {
    await updateBook(id, bookData);
    setBookFormOpen(false);
  };

  const activeLoans = getActiveLoans();
  const returnedLoans = getReturnedLoans();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-black rounded-2xl flex items-center justify-center mb-4 shadow-xl">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Console Admin</h2>
            <p className="text-slate-500 mt-2">Masukkan PIN keamanan untuk melanjutkan</p>
          </div>
          
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="PIN Keamanan"
              value={pinInput}
              onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
              className={`h-14 text-center text-2xl tracking-[1em] rounded-2xl border-slate-200 bg-slate-50 ${pinError ? 'border-destructive ring-destructive' : ''}`}
              maxLength={4}
            />
            <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-semibold shadow-lg shadow-primary/20 transition-transform active:scale-95">
              Buka Akses
            </Button>
            <Button type="button" variant="ghost" className="w-full text-slate-500" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Katalog
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-black rounded-xl flex items-center justify-center shadow-lg">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight block leading-none">Admin Console</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">E-Lib Management</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="rounded-full gap-2 border-slate-200" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Lihat Katalog</span>
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full text-destructive hover:bg-destructive/5" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <Tabs defaultValue="books" className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h2 className="text-4xl font-bold tracking-tight mb-2">Management Panel</h2>
              <p className="text-slate-500 italic">Kelola koleksi buku dan pantau sirkulasi peminjaman siswa.</p>
            </div>

            <TabsList className="bg-slate-100 p-1 rounded-2xl h-12">
              <TabsTrigger value="books" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <BookMarked className="h-4 w-4 mr-2" /> Koleksi
              </TabsTrigger>
              <TabsTrigger value="active" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <History className="h-4 w-4 mr-2" /> Peminjaman ({activeLoans.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Riwayat
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="books" className="animate-in fade-in duration-500 m-0">
  <div className="flex items-center justify-between mb-6">
    <h3 className="text-lg font-bold flex items-center gap-2">
      Daftar Buku <Badge variant="secondary" className="rounded-full font-mono">{books.length}</Badge>
    </h3>
    <Button onClick={handleAddBook} className="rounded-full shadow-lg shadow-primary/20 sm:h-11">
      <Plus className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Tambah Koleksi</span><span className="sm:hidden">Tambah</span>
    </Button>
  </div>

  <div className="border border-slate-100 rounded-[2rem] bg-white shadow-sm overflow-hidden">
    <div className="overflow-x-auto"> {/* Container scroll hanya jika benar-benar sempit */}
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent border-slate-100">
            <TableHead className="py-4 px-6 font-bold text-slate-800">Buku</TableHead>
            <TableHead className="font-bold text-slate-800 hidden md:table-cell">Kategori</TableHead>
            <TableHead className="font-bold text-slate-800">Stok</TableHead>
            <TableHead className="text-right py-4 px-6 font-bold text-slate-800">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.map((book) => (
            <TableRow key={book.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
              <TableCell className="py-4 px-6">
                <div className="flex items-center gap-3 max-w-[180px] sm:max-w-[300px]">
                  <div className="w-10 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 hidden sm:block">
                    {book.cover_url ? (
                      <img src={book.cover_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><BookOpen className="h-4 w-4 text-slate-300" /></div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate leading-tight">{book.title}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{book.author}</p>
                    {/* Munculkan kategori di bawah judul hanya untuk mobile */}
                    <span className="md:hidden text-[9px] font-bold text-primary/70 uppercase">{book.category}</span>
                  </div>
                </div>
              </TableCell>
              
              <TableCell className="hidden md:table-cell">
                <Badge variant="outline" className="rounded-full text-[10px] font-medium border-slate-200 py-0 px-2">
                  {book.category}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-700">{book.stock}</span>
                  <div className="h-1 w-8 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className={`h-full ${book.stock > 0 ? 'bg-primary' : 'bg-destructive'}`} 
                      style={{ width: `${Math.min((book.stock / 10) * 100, 100)}%` }} 
                    />
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-right py-4 px-6">
                <div className="flex items-center justify-end gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors" 
                    onClick={() => handleEditBook(book)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors" 
                    onClick={() => handleDeleteClick(book)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
</TabsContent>

          <TabsContent value="active" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-8">
              <LoanTable loans={activeLoans} title="Peminjaman Aktif" description="Siswa yang belum mengembalikan buku." emptyMessage="Semua buku sudah dikembalikan." />
            </div>
          </TabsContent>

          <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-8">
              <LoanTable loans={returnedLoans} title="Riwayat" description="Data sirkulasi yang telah selesai." showReturnDate emptyMessage="Belum ada riwayat." />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <AdminBookForm book={editingBook} open={bookFormOpen} onOpenChange={setBookFormOpen} onSave={handleSaveBook} onUpdate={handleUpdateBook} />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">Hapus koleksi ini?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini permanen. Buku "{bookToDelete?.title}" akan dihapus dari sistem.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90 rounded-full">Ya, Hapus Buku</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}