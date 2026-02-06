import { Book, Loan } from '@/types/library';

// Mock data - Replace with Supabase queries
export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Laskar Pelangi',
    author: 'Andrea Hirata',
    publisher: 'Bentang Pustaka',
    year: 2005,
    category: 'Novel',
    description: 'Novel inspiratif tentang perjuangan anak-anak Belitung untuk mendapatkan pendidikan.',
    cover_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1410632027i/1362193.jpg',
    isbn: '9789793062792',
    stock: 3,
    status: 'available',
  },
  {
    id: '2',
    title: 'Bumi Manusia',
    author: 'Pramoedya Ananta Toer',
    publisher: 'Hasta Mitra',
    year: 1980,
    category: 'Novel',
    description: 'Novel pertama dari Tetralogi Buru yang menceritakan kisah Minke di era kolonial.',
    cover_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1565392935i/1398034.jpg',
    isbn: '9789799731234',
    stock: 2,
    status: 'available',
  },
  {
    id: '3',
    title: 'Filosofi Teras',
    author: 'Henry Manampiring',
    publisher: 'Kompas',
    year: 2018,
    category: 'Non-Fiksi',
    description: 'Buku tentang filosofi Stoa dan penerapannya dalam kehidupan modern.',
    cover_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1549204790i/42861019.jpg',
    isbn: '9786024125875',
    stock: 0,
    status: 'borrowed',
  },
  {
    id: '4',
    title: 'Atomic Habits',
    author: 'James Clear',
    publisher: 'Gramedia',
    year: 2019,
    category: 'Non-Fiksi',
    description: 'Cara mudah dan terbukti untuk membangun kebiasaan baik dan menghilangkan kebiasaan buruk.',
    cover_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385i/40121378.jpg',
    isbn: '9786020633176',
    stock: 5,
    status: 'available',
  },
  {
    id: '5',
    title: 'Sapiens: Riwayat Singkat Umat Manusia',
    author: 'Yuval Noah Harari',
    publisher: 'Kepustakaan Populer Gramedia',
    year: 2017,
    category: 'Sejarah',
    description: 'Sejarah umat manusia dari zaman batu hingga era modern.',
    cover_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1595674533i/23692271.jpg',
    isbn: '9786024240240',
    stock: 1,
    status: 'available',
  },
  {
    id: '6',
    title: 'Sejarah Dunia yang Disembunyikan',
    author: 'Jonathan Black',
    publisher: 'Alvabet',
    year: 2015,
    category: 'Sejarah',
    description: 'Mengungkap sejarah tersembunyi dari berbagai peradaban kuno.',
    cover_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1347493874i/5722.jpg',
    isbn: '9786021193143',
    stock: 0,
    status: 'borrowed',
  },
];

export const mockLoans: Loan[] = [
  {
    id: '1',
    book_id: '3',
    student_name: 'Ahmad Rizky',
    student_class: 'XII IPA 1',
    student_nis: '12345',
    borrow_date: '2024-01-15',
    return_date: null,
    status: 'active',
  },
  {
    id: '2',
    book_id: '6',
    student_name: 'Siti Nurhaliza',
    student_class: 'XI IPS 2',
    student_nis: '12346',
    borrow_date: '2024-01-10',
    return_date: null,
    status: 'active',
  },
  {
    id: '3',
    book_id: '1',
    student_name: 'Budi Santoso',
    student_class: 'X MIPA 3',
    student_nis: '12347',
    borrow_date: '2024-01-05',
    return_date: '2024-01-12',
    status: 'returned',
  },
];

// Helper to get book by ID
export const getBookById = (id: string): Book | undefined => {
  return mockBooks.find((book) => book.id === id);
};

// Helper to get loans with book data
export const getLoansWithBooks = (): (Loan & { book: Book | undefined })[] => {
  return mockLoans.map((loan) => ({
    ...loan,
    book: getBookById(loan.book_id),
  }));
};

// Helper to get active loans by NIS
export const getActiveLoansByNis = (nis: string): (Loan & { book: Book | undefined })[] => {
  return mockLoans
    .filter((loan) => loan.student_nis === nis && loan.status === 'active')
    .map((loan) => ({
      ...loan,
      book: getBookById(loan.book_id),
    }));
};
