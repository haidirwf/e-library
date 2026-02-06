import { GoogleBooksResponse, GoogleBookVolume, Book } from '@/types/library';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

// Search queries for Indonesian school library books
const LIBRARY_QUERIES = [
  'buku indonesia novel',
  'buku sejarah indonesia',
  'buku sains populer',
  'buku pendidikan indonesia',
  'buku fiksi remaja indonesia',
];

export async function searchGoogleBooks(query: string): Promise<GoogleBookVolume[]> {
  try {
    const response = await fetch(
      `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=10&langRestrict=id&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Google Books API');
    }

    const data: GoogleBooksResponse = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error searching Google Books:', error);
    throw error;
  }
}

export async function searchByISBN(isbn: string): Promise<GoogleBookVolume | null> {
  try {
    const response = await fetch(
      `${GOOGLE_BOOKS_API}?q=isbn:${encodeURIComponent(isbn)}&maxResults=1&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Google Books API');
    }

    const data: GoogleBooksResponse = await response.json();
    return data.items?.[0] || null;
  } catch (error) {
    console.error('Error searching by ISBN:', error);
    throw error;
  }
}

export function extractBookData(volume: GoogleBookVolume) {
  const { volumeInfo } = volume;

  return {
    title: volumeInfo.title || '',
    author: volumeInfo.authors?.join(', ') || '',
    publisher: volumeInfo.publisher || '',
    year: volumeInfo.publishedDate
      ? parseInt(volumeInfo.publishedDate.substring(0, 4), 10)
      : new Date().getFullYear(),
    description: volumeInfo.description || '',
    cover_url: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
    isbn: volumeInfo.industryIdentifiers?.find(
      (id) => id.type === 'ISBN_13' || id.type === 'ISBN_10'
    )?.identifier || '',
    category: volumeInfo.categories?.[0] || 'Lainnya',
  };
}

export function convertVolumeToBook(volume: GoogleBookVolume): Book {
  const bookData = extractBookData(volume);

  const categoryMap: Record<string, string> = {
    Fiction: 'Fiksi',
    Novel: 'Novel',
    History: 'Sejarah',
    Science: 'Sains',
    Education: 'Non-Fiksi',
    Religion: 'Agama',
    Technology: 'Teknologi',
    Art: 'Seni',
    Sports: 'Olahraga',
    Biography: 'Biografi',
    Comics: 'Komik',
  };

  let mappedCategory = 'Lainnya';
  const originalCategory = volume.volumeInfo.categories?.[0] || '';

  for (const [key, value] of Object.entries(categoryMap)) {
    if (originalCategory.toLowerCase().includes(key.toLowerCase())) {
      mappedCategory = value;
      break;
    }
  }

  return {
    id: volume.id,
    title: bookData.title,
    author: bookData.author || 'Penulis Tidak Diketahui',
    publisher: bookData.publisher || 'Penerbit Tidak Diketahui',
    year: bookData.year,
    category: mappedCategory,
    description: bookData.description || 'Deskripsi tidak tersedia.',
    cover_url: bookData.cover_url,
    isbn: bookData.isbn,
    stock: Math.floor(Math.random() * 5) + 1,
    status: 'available',
  };
}
