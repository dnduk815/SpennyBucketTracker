import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Pagination from "@/components/ui/pagination";

interface Transaction {
  id: string;
  bucketId: string;
  bucketName: string;
  amount: number;
  description: string;
  date: string;
}

interface Bucket {
  id: string;
  name: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}

export default function TransactionList({
  transactions,
  currentPage,
  onPageChange,
  itemsPerPage = 10,
}: TransactionListProps) {
  // Calculate pagination
  const totalItems = transactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

  const groupedByDate = paginatedTransactions.reduce((acc, transaction) => {
    const date = format(new Date(transaction.date), "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
    b.localeCompare(a)
  );

  if (sortedDates.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No transactions yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
      />

      {sortedDates.map((date) => (
        <div key={date} className="space-y-2">
          <div
            className="text-xs uppercase text-muted-foreground font-medium tracking-wide px-1"
            data-testid={`text-date-${date}`}
          >
            {format(new Date(date), "MMMM d, yyyy")}
          </div>
          <div className="space-y-2">
            {groupedByDate[date].map((transaction) => (
              <Card
                key={transaction.id}
                className="p-4 flex items-center gap-3"
                data-testid={`card-transaction-${transaction.id}`}
              >
                <div className={`w-1 h-12 rounded-full bg-primary`} />
                <div className="flex-1 min-w-0">
                  <div
                    className="font-medium"
                    data-testid="text-transaction-description"
                  >
                    {transaction.description || "Transaction"}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      data-testid="badge-bucket-name"
                    >
                      {transaction.bucketName}
                    </Badge>
                    <span
                      className="text-xs"
                      data-testid="text-transaction-time"
                    >
                      {format(new Date(transaction.date), "h:mm a")}
                    </span>
                  </div>
                </div>
                <div
                  className="text-lg font-bold tabular-nums"
                  data-testid="text-transaction-amount"
                >
                  ${transaction.amount.toFixed(2)}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
      />
    </div>
  );
}
