import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowRightLeft, ArrowRight, Plus, Minus } from "lucide-react";
import Pagination from "@/components/ui/pagination";

interface Transaction {
  id: string;
  bucketId: string;
  bucketName: string;
  amount: number;
  description: string;
  date: string;
}

interface AllocationHistory {
  id: string;
  userId: string;
  sourceBucketId: string | null;
  destinationBucketId: string | null;
  amount: string;
  transferType: "allocation" | "reallocation";
  description: string | null;
  date: string;
  createdAt: string;
  sourceBucketName?: string;
  destinationBucketName?: string;
}

interface IncomeRecord {
  id: string;
  userId: string;
  amount: string;
  description: string | null;
  date: string;
  createdAt: string;
}

interface AllActivitiesListProps {
  transactions: Transaction[];
  allocations: AllocationHistory[];
  incomeRecords: IncomeRecord[];
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}

type ActivityItem = {
  id: string;
  type: "transaction" | "allocation" | "income";
  date: string;
  data: Transaction | AllocationHistory | IncomeRecord;
};

export default function AllActivitiesList({
  transactions,
  allocations,
  incomeRecords,
  currentPage,
  onPageChange,
  itemsPerPage = 10,
}: AllActivitiesListProps) {
  // Combine all activities into a single array
  const allActivities: ActivityItem[] = [
    ...transactions.map((t) => ({
      id: `transaction-${t.id}`,
      type: "transaction" as const,
      date: t.date,
      data: t,
    })),
    ...allocations.map((a) => ({
      id: `allocation-${a.id}`,
      type: "allocation" as const,
      date: a.date,
      data: a,
    })),
    ...incomeRecords.map((i) => ({
      id: `income-${i.id}`,
      type: "income" as const,
      date: i.date,
      data: i,
    })),
  ];

  // Sort by date (newest first)
  allActivities.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate pagination
  const totalItems = allActivities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedActivities = allActivities.slice(startIndex, endIndex);

  // Group paginated activities by date
  const groupedByDate = paginatedActivities.reduce((acc, activity) => {
    const date = format(new Date(activity.date), "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, ActivityItem[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
    b.localeCompare(a)
  );

  if (sortedDates.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No activities yet. Add transactions, allocate funds, or record income to
        get started!
      </div>
    );
  }

  const getActivityTypeBadge = (type: string) => {
    switch (type) {
      case "transaction":
        return (
          <Badge
            variant="secondary"
            className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
          >
            Transaction
          </Badge>
        );
      case "allocation":
        return (
          <Badge
            variant="secondary"
            className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            Allocation
          </Badge>
        );
      case "income":
        return (
          <Badge
            variant="secondary"
            className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            Income
          </Badge>
        );
      default:
        return null;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case "transaction":
        return "bg-orange-500";
      case "allocation":
        return "bg-blue-500";
      case "income":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const renderTransaction = (transaction: Transaction) => (
    <>
      <div className="font-medium">
        {transaction.description || "Transaction"}
      </div>
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {transaction.bucketName}
        </Badge>
        <span className="text-xs">
          {format(new Date(transaction.date), "h:mm a")}
        </span>
      </div>
      <div className="text-lg font-bold tabular-nums">
        ${transaction.amount.toFixed(2)}
      </div>
    </>
  );

  const renderAllocation = (allocation: AllocationHistory) => {
    const getTransferDisplay = () => {
      if (allocation.transferType === "allocation") {
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Unallocated</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">
              {allocation.destinationBucketName || "Unknown Bucket"}
            </span>
          </div>
        );
      } else {
        const sourceName = allocation.sourceBucketName || "Unknown Bucket";
        const destName = allocation.destinationBucketId
          ? allocation.destinationBucketName || "Unknown Bucket"
          : "Unallocated";

        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{sourceName}</span>
            <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{destName}</span>
          </div>
        );
      }
    };

    const getTransferTypeBadge = () => {
      if (allocation.transferType === "allocation") {
        return (
          <Badge
            variant="secondary"
            className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            New Allocation
          </Badge>
        );
      } else {
        return (
          <Badge
            variant="secondary"
            className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
          >
            Reallocation
          </Badge>
        );
      }
    };

    return (
      <>
        <div className="font-medium">
          {allocation.description || "Allocation Transfer"}
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
          {getTransferDisplay()}
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
          {getTransferTypeBadge()}
          <span className="text-xs">
            {format(new Date(allocation.date), "h:mm a")}
          </span>
        </div>
        <div className="text-lg font-bold tabular-nums">
          ${parseFloat(allocation.amount).toFixed(2)}
        </div>
      </>
    );
  };

  const renderIncome = (income: IncomeRecord) => {
    const getAmountDisplay = () => {
      const numAmount = parseFloat(income.amount);
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

    const getTypeBadge = () => {
      const numAmount = parseFloat(income.amount);
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
      <>
        <div className="font-medium">
          {income.description ||
            (parseFloat(income.amount) > 0 ? "Income Added" : "Funds Removed")}
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
          {getTypeBadge()}
          <span className="text-xs">
            {format(new Date(income.date), "h:mm a")}
          </span>
        </div>
        {getAmountDisplay()}
      </>
    );
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
            {groupedByDate[date].map((activity) => (
              <Card key={activity.id} className="p-4 flex items-center gap-3">
                <div
                  className={`w-1 h-12 rounded-full ${getBorderColor(
                    activity.type
                  )}`}
                />
                <div className="flex-1 min-w-0">
                  {activity.type === "transaction" &&
                    renderTransaction(activity.data as Transaction)}
                  {activity.type === "allocation" &&
                    renderAllocation(activity.data as AllocationHistory)}
                  {activity.type === "income" &&
                    renderIncome(activity.data as IncomeRecord)}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getActivityTypeBadge(activity.type)}
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
