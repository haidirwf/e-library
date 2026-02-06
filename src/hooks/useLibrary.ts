import { useState, useCallback } from 'react';
import { Book, Loan } from '@/types/library';
import { mockBooks, mockLoans, getBookById } from '@/data/mockData';

// This hook manages library state with mock data
// Replace the implementation with Supabase queries when integrating

export function useBooks() {
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [loading, setLoading] = useState(false);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    // TODO: Replace with Supabase query
    // const { data, error } = await supabase.from('books').select('*');
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay
    setBooks(mockBooks);
    setLoading(false);
  }, []);

  const addBook = useCallback(async (book: Omit<Book, 'id' | 'status'>) => {
    setLoading(true);
    // TODO: Replace with Supabase insert
    const newBook: Book = {
      ...book,
      id: Date.now().toString(),
      status: book.stock > 0 ? 'available' : 'borrowed',
    };
    await new Promise((resolve) => setTimeout(resolve, 300));
    setBooks((prev) => [...prev, newBook]);
    setLoading(false);
    return newBook;
  }, []);

  const updateBook = useCallback(async (id: string, updates: Partial<Book>) => {
    setLoading(true);
    // TODO: Replace with Supabase update
    await new Promise((resolve) => setTimeout(resolve, 300));
    setBooks((prev) =>
      prev.map((book) =>
        book.id === id
          ? { ...book, ...updates, status: (updates.stock ?? book.stock) > 0 ? 'available' : 'borrowed' }
          : book
      )
    );
    setLoading(false);
  }, []);

  const deleteBook = useCallback(async (id: string) => {
    setLoading(true);
    // TODO: Replace with Supabase delete
    await new Promise((resolve) => setTimeout(resolve, 300));
    setBooks((prev) => prev.filter((book) => book.id !== id));
    setLoading(false);
  }, []);

  const decrementStock = useCallback(async (id: string) => {
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id === id && book.stock > 0) {
          const newStock = book.stock - 1;
          return { ...book, stock: newStock, status: newStock > 0 ? 'available' : 'borrowed' };
        }
        return book;
      })
    );
  }, []);

  const incrementStock = useCallback(async (id: string) => {
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id === id) {
          const newStock = book.stock + 1;
          return { ...book, stock: newStock, status: 'available' };
        }
        return book;
      })
    );
  }, []);

  return {
    books,
    loading,
    fetchBooks,
    addBook,
    updateBook,
    deleteBook,
    decrementStock,
    incrementStock,
  };
}

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>(mockLoans);
  const [loading, setLoading] = useState(false);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    // TODO: Replace with Supabase query with join
    await new Promise((resolve) => setTimeout(resolve, 300));
    setLoans(mockLoans);
    setLoading(false);
  }, []);

  const createLoan = useCallback(
    async (loan: Omit<Loan, 'id' | 'status' | 'return_date'>) => {
      setLoading(true);
      // TODO: Replace with Supabase insert
      const newLoan: Loan = {
        ...loan,
        id: Date.now().toString(),
        return_date: null,
        status: 'active',
      };
      await new Promise((resolve) => setTimeout(resolve, 300));
      setLoans((prev) => [...prev, newLoan]);
      setLoading(false);
      return newLoan;
    },
    []
  );

  const returnBook = useCallback(async (loanId: string) => {
    setLoading(true);
    // TODO: Replace with Supabase update
    await new Promise((resolve) => setTimeout(resolve, 300));
    setLoans((prev) =>
      prev.map((loan) =>
        loan.id === loanId
          ? { ...loan, return_date: new Date().toISOString().split('T')[0], status: 'returned' as const }
          : loan
      )
    );
    setLoading(false);
  }, []);

  const getLoansByNis = useCallback(
    (nis: string) => {
      return loans
        .filter((loan) => loan.student_nis === nis && loan.status === 'active')
        .map((loan) => ({
          ...loan,
          book: getBookById(loan.book_id),
        }));
    },
    [loans]
  );

  const getActiveLoans = useCallback(() => {
    return loans
      .filter((loan) => loan.status === 'active')
      .map((loan) => ({
        ...loan,
        book: getBookById(loan.book_id),
      }));
  }, [loans]);

  const getReturnedLoans = useCallback(() => {
    return loans
      .filter((loan) => loan.status === 'returned')
      .map((loan) => ({
        ...loan,
        book: getBookById(loan.book_id),
      }));
  }, [loans]);

  return {
    loans,
    loading,
    fetchLoans,
    createLoan,
    returnBook,
    getLoansByNis,
    getActiveLoans,
    getReturnedLoans,
  };
}
