export type BookStatus = 'available' | 'borrowed';

export interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  category: string;
  description: string;
  cover_url: string;
  isbn: string;
  stock: number;
  status: BookStatus;
  created_at?: string;
  updated_at?: string;
}

export type LoanStatus = 'active' | 'returned';

export interface Loan {
  id: string;
  book_id: string;
  student_name: string;
  student_class: string;
  student_nis: string;
  borrow_date: string;
  return_date: string | null;
  status: LoanStatus;
  created_at?: string;
  // Joined data
  book?: Book;
}

export interface GoogleBookVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    categories?: string[];
  };
}

export interface GoogleBooksResponse {
  items?: GoogleBookVolume[];
  totalItems: number;
}

export const BOOK_CATEGORIES = [
  'Fiksi',
  'Non-Fiksi',
  'Sains',
  'Matematika',
  'Sejarah',
  'Bahasa',
  'Agama',
  'Teknologi',
  'Seni',
  'Olahraga',
  'Ensiklopedia',
  'Komik',
  'Novel',
  'Biografi',
  'Lainnya',
] as const;

export type BookCategory = (typeof BOOK_CATEGORIES)[number];
