import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";

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
  buckets: Bucket[];
}

export default function TransactionList({ transactions, buckets }: TransactionListProps) {
  const groupedByDate = transactions.reduce((acc, transaction) => {
    const date = format(new Date(transaction.date), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  const renderTransactions = (filteredTransactions: Transaction[]) => {
    const filtered = filteredTransactions.reduce((acc, transaction) => {
      const date = format(new Date(transaction.date), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    }, {} as Record<string, Transaction[]>);

    const dates = Object.keys(filtered).sort((a, b) => b.localeCompare(a));

    if (dates.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          No transactions yet
        </div>
      );
    }

    return dates.map((date) => (
      <div key={date} className="space-y-2">
        <div className="text-xs uppercase text-muted-foreground font-medium tracking-wide px-1" data-testid={`text-date-${date}`}>
          {format(new Date(date), 'MMMM d, yyyy')}
        </div>
        <div className="space-y-2">
          {filtered[date].map((transaction) => (
            <Card
              key={transaction.id}
              className="p-4 flex items-center gap-3"
              data-testid={`card-transaction-${transaction.id}`}
            >
              <div className={`w-1 h-12 rounded-full bg-primary`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium" data-testid="text-transaction-description">
                  {transaction.description || "Transaction"}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs" data-testid="badge-bucket-name">
                    {transaction.bucketName}
                  </Badge>
                  <span className="text-xs" data-testid="text-transaction-time">
                    {format(new Date(transaction.date), 'h:mm a')}
                  </span>
                </div>
              </div>
              <div className="text-lg font-bold tabular-nums" data-testid="text-transaction-amount">
                ${transaction.amount.toFixed(2)}
              </div>
            </Card>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start" data-testid="tabs-filter">
          <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
          {buckets.map((bucket) => (
            <TabsTrigger key={bucket.id} value={bucket.id} data-testid={`tab-${bucket.name.toLowerCase().replace(/\s+/g, '-')}`}>
              {bucket.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {renderTransactions(transactions)}
        </TabsContent>

        {buckets.map((bucket) => (
          <TabsContent key={bucket.id} value={bucket.id} className="space-y-4 mt-4">
            {renderTransactions(transactions.filter(t => t.bucketId === bucket.id))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
