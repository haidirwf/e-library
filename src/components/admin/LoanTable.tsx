import { Loan, Book } from '@/types/library';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, User, Calendar, CheckCircle2 } from 'lucide-react';

interface LoanTableProps {
  loans: (Loan & { book?: Book })[];
  title: string;
  description: string;
  showReturnDate?: boolean;
  emptyMessage: string;
}

export function LoanTable({ loans, title, description, showReturnDate = false, emptyMessage }: LoanTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {showReturnDate ? (
            <CheckCircle2 className="h-5 w-5 text-primary" />
          ) : (
            <BookOpen className="h-5 w-5 text-primary" />
          )}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Buku</TableHead>
                  <TableHead>Peminjam</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>NIS</TableHead>
                  <TableHead>Tgl Pinjam</TableHead>
                  {showReturnDate && <TableHead>Tgl Kembali</TableHead>}
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                          {loan.book?.cover_url ? (
                            <img
                              src={loan.book.cover_url}
                              alt={loan.book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="h-3 w-3 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm line-clamp-1">
                            {loan.book?.title || 'Tidak diketahui'}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {loan.book?.author}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{loan.student_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {loan.student_class}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{loan.student_nis}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(loan.borrow_date).toLocaleDateString('id-ID')}
                      </div>
                    </TableCell>
                    {showReturnDate && (
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {loan.return_date
                            ? new Date(loan.return_date).toLocaleDateString('id-ID')
                            : '-'}
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge
                        variant={loan.status === 'active' ? 'default' : 'secondary'}
                        className={loan.status === 'active' ? 'bg-primary' : ''}
                      >
                        {loan.status === 'active' ? 'Dipinjam' : 'Dikembalikan'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
