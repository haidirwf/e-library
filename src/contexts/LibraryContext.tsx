import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Book, Loan } from '@/types/library';
import { fetchLibraryBooks } from '@/lib/googleBooks';

interface LibraryContextType {
  // Books
  books: Book[];
  booksLoading: boolean;
  fetchBooks: () => Promise<void>;
  addBook: (book: Omit<Book, 'id' | 'status'>) => Promise<Book>;
  updateBook: (id: string, updates: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  
  // Loans
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

  // Fetch books from Google Books on mount
  useEffect(() => {
    fetchBooks();
  }, []);

  // Book operations
  const fetchBooks = useCallback(async () => {
    setBooksLoading(true);
    try {
      const googleBooks = await fetchLibraryBooks();
      setBooks(googleBooks);
    } catch (error) {
      console.error('Failed to fetch books:', error);
      setBooks([]);
    } finally {
      setBooksLoading(false);
    }
  }, []);

  const addBook = useCallback(async (book: Omit<Book, 'id' | 'status'>) => {
    setBooksLoading(true);
    const newBook: Book = {
      ...book,
      id: `local-${Date.now()}`,
      status: book.stock > 0 ? 'available' : 'borrowed',
    };
    await new Promise((resolve) => setTimeout(resolve, 300));
    setBooks((prev) => [...prev, newBook]);
    setBooksLoading(false);
    return newBook;
  }, []);

  const updateBook = useCallback(async (id: string, updates: Partial<Book>) => {
    setBooksLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setBooks((prev) =>
      prev.map((book) =>
        book.id === id
          ? { ...book, ...updates, status: (updates.stock ?? book.stock) > 0 ? 'available' : 'borrowed' }
          : book
      )
    );
    setBooksLoading(false);
  }, []);

  const deleteBook = useCallback(async (id: string) => {
    setBooksLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setBooks((prev) => prev.filter((book) => book.id !== id));
    setBooksLoading(false);
  }, []);

  // Loan operations
  const fetchLoans = useCallback(async () => {
    setLoansLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setLoansLoading(false);
  }, []);

  const createLoan = useCallback(
    async (loan: Omit<Loan, 'id' | 'status' | 'return_date'>) => {
      setLoansLoading(true);
      const newLoan: Loan = {
        ...loan,
        id: Date.now().toString(),
        return_date: null,
        status: 'active',
      };
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      // Decrement book stock
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
    },
    []
  );

  const returnBook = useCallback(async (loanId: string, bookId: string) => {
    setLoansLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    // Update loan status
    setLoans((prev) =>
      prev.map((loan) =>
        loan.id === loanId
          ? { ...loan, return_date: new Date().toISOString().split('T')[0], status: 'returned' as const }
          : loan
      )
    );
    
    // Increment book stock
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id === bookId) {
          const newStock = book.stock + 1;
          return { ...book, stock: newStock, status: 'available' };
        }
        return book;
      })
    );
    
    setLoansLoading(false);
  }, []);

  const getLoansByNis = useCallback(
    (nis: string) => {
      return loans
        .filter((loan) => loan.student_nis === nis && loan.status === 'active')
        .map((loan) => ({
          ...loan,
          book: books.find((b) => b.id === loan.book_id),
        }));
    },
    [loans, books]
  );

  const getActiveLoans = useCallback(() => {
    return loans
      .filter((loan) => loan.status === 'active')
      .map((loan) => ({
        ...loan,
        book: books.find((b) => b.id === loan.book_id),
      }));
  }, [loans, books]);

  const getReturnedLoans = useCallback(() => {
    return loans
      .filter((loan) => loan.status === 'returned')
      .map((loan) => ({
        ...loan,
        book: books.find((b) => b.id === loan.book_id),
      }));
  }, [loans, books]);

  return (
    <LibraryContext.Provider
      value={{
        books,
        booksLoading,
        fetchBooks,
        addBook,
        updateBook,
        deleteBook,
        loans,
        loansLoading,
        fetchLoans,
        createLoan,
        returnBook,
        getLoansByNis,
        getActiveLoans,
        getReturnedLoans,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}
