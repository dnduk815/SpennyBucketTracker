import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Plus, Minus } from "lucide-react";
import Pagination from "@/components/ui/pagination";

interface IncomeRecord {
  id: string;
  userId: string;
  amount: string;
  description: string | null;
  date: string;
  createdAt: string;
}

interface IncomeHistoryListProps {
  incomeRecords: IncomeRecord[];
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}

export default function IncomeHistoryList({
  incomeRecords,
  currentPage,
  onPageChange,
  itemsPerPage = 10,
}: IncomeHistoryListProps) {
  // Calculate pagination
  const totalItems = incomeRecords.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedIncomeRecords = incomeRecords.slice(startIndex, endIndex);

  const groupedByDate = paginatedIncomeRecords.reduce((acc, record) => {
    const date = format(new Date(record.date), "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {} as Record<string, IncomeRecord[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
    b.localeCompare(a)
  );

  if (sortedDates.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No income history yet
      </div>
    );
  }

  const getAmountDisplay = (amount: string) => {
    const numAmount = parseFloat(amount);
    const isPositive = numAmount > 0;
    const prefix = isPositive ? "+" : "";
    const colorClass = isPositive
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";

    return (
      <div className={`text-lg font-bold tabular-nums ${colorClass}`}>
        {prefix}${Math.abs(numAmount).toFixed(2)}
      </div>
    );
  };

  const getBorderColor = (amount: string) => {
    const numAmount = parseFloat(amount);
    return numAmount > 0 ? "bg-green-500" : "bg-red-500";
  };

  const getTypeBadge = (amount: string) => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      return (
        <Badge
          variant="secondary"
          className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        >
          <Plus className="w-3 h-3 mr-1" />
          Income Added
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="secondary"
          className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        >
          <Minus className="w-3 h-3 mr-1" />
          Funds Removed
        </Badge>
      );
    }
  };

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
          <div className="text-xs uppercase text-muted-foreground font-medium tracking-wide px-1">
            {format(new Date(date), "MMMM d, yyyy")}
          </div>
          <div className="space-y-2">
            {groupedByDate[date].map((record) => (
              <Card key={record.id} className="p-4 flex items-center gap-3">
                <div
                  className={`w-1 h-12 rounded-full ${getBorderColor(
                    record.amount
                  )}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">
                    {record.description ||
                      (parseFloat(record.amount) > 0
                        ? "Income Added"
                        : "Funds Removed")}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    {getTypeBadge(record.amount)}
                    <span className="text-xs">
                      {format(new Date(record.date), "h:mm a")}
                    </span>
                  </div>
                </div>
                {getAmountDisplay(record.amount)}
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
