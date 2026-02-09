import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Book, Loan } from '@/types/library';
import { searchGoogleBooks, convertVolumeToBook, LIBRARY_QUERIES } from '@/lib/googleBooks';
import { toast } from '@/hooks/use-toast';

interface LibraryContextType {
  books: Book[];
  booksLoading: boolean;
  addBook: (book: Omit<Book, 'id' | 'status'>) => Promise<Book>;
  updateBook: (id: string, updates: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  loans: Loan[];
  loansLoading: boolean;
  fetchLoans: () => Promise<void>;
  createLoan: (loan: Omit<Loan, 'id' | 'status' | 'return_date'>) => Promise<Loan>;
  returnBook: (loanId: string, bookId: string) => Promise<void>;
  getLoansByNis: (nis: string) => (Loan & { book?: Book })[];
  getActiveLoans: () => (Loan & { book?: Book })[];
  getReturnedLoans: () => (Loan & { book?: Book })[];
}

const LibraryContext = createContext<LibraryContextType | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [loansLoading, setLoansLoading] = useState(false);

  // Fungsi untuk fetch 20 buku dari Google Books API
  const fetchInitialBooks = useCallback(async () => {
    setBooksLoading(true);
    try {
      // Ambil query acak agar hasil tidak selalu sama saat refresh
      const randomQuery = LIBRARY_QUERIES[Math.floor(Math.random() * LIBRARY_QUERIES.length)];
      const items = await searchGoogleBooks(randomQuery);
      
      const formattedBooks = items.map(item => convertVolumeToBook(item));
      setBooks(formattedBooks);
    } catch (error) {
      toast({
        title: 'Gagal memuat buku',
        description: 'Pastikan koneksi internet aktif dan API Key benar.',
        variant: 'destructive',
      });
    } finally {
      setBooksLoading(false);
    }
  }, []);

  // Jalankan saat pertama kali aplikasi dibuka
  useEffect(() => {
    fetchInitialBooks();
  }, [fetchInitialBooks]);

  const addBook = useCallback(async (bookData: Omit<Book, 'id' | 'status'>) => {
    const newBook: Book = {
      ...bookData,
      id: `local-${Date.now()}`,
      status: bookData.stock > 0 ? 'available' : 'borrowed',
    };
    setBooks((prev) => [newBook, ...prev]); // Tambah ke atas list
    return newBook;
  }, []);

  const updateBook = useCallback(async (id: string, updates: Partial<Book>) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === id
          ? { ...book, ...updates, status: (updates.stock ?? book.stock) > 0 ? 'available' : 'borrowed' }
          : book
      )
    );
  }, []);

  const deleteBook = useCallback(async (id: string) => {
    setBooks((prev) => prev.filter((book) => book.id !== id));
  }, []);

  const fetchLoans = useCallback(async () => {
    setLoansLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setLoansLoading(false);
  }, []);

  const createLoan = useCallback(async (loan: Omit<Loan, 'id' | 'status' | 'return_date'>) => {
    setLoansLoading(true);
    const newLoan: Loan = {
      ...loan,
      id: Date.now().toString(),
      return_date: null,
      status: 'active',
    };
    
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id === loan.book_id && book.stock > 0) {
          const newStock = book.stock - 1;
          return { ...book, stock: newStock, status: newStock > 0 ? 'available' : 'borrowed' };
        }
        return book;
      })
    );
    
    setLoans((prev) => [...prev, newLoan]);
    setLoansLoading(false);
    return newLoan;
  }, []);

  const returnBook = useCallback(async (loanId: string, bookId: string) => {
    setLoans((prev) =>
      prev.map((loan) =>
        loan.id === loanId
          ? { ...loan, return_date: new Date().toISOString().split('T')[0], status: 'returned' as const }
          : loan
      )
    );
    
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id === bookId) {
          const newStock = book.stock + 1;
          return { ...book, stock: newStock, status: 'available' };
        }
        return book;
      })
    );
  }, []);

  const getLoansByNis = useCallback((nis: string) => {
    return loans
      .filter((loan) => loan.student_nis === nis && loan.status === 'active')
      .map((loan) => ({ ...loan, book: books.find((b) => b.id === loan.book_id) }));
  }, [loans, books]);

  const getActiveLoans = useCallback(() => {
    return loans
      .filter((loan) => loan.status === 'active')
      .map((loan) => ({ ...loan, book: books.find((b) => b.id === loan.book_id) }));
  }, [loans, books]);

  const getReturnedLoans = useCallback(() => {
    return loans
      .filter((loan) => loan.status === 'returned')
      .map((loan) => ({ ...loan, book: books.find((b) => b.id === loan.book_id) }));
  }, [loans, books]);

  return (
    <LibraryContext.Provider
      value={{
        books, booksLoading, addBook, updateBook, deleteBook,
        loans, loansLoading, fetchLoans, createLoan, returnBook,
        getLoansByNis, getActiveLoans, getReturnedLoans,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used within a LibraryProvider');
  return context;
}