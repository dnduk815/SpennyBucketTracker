import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowRightLeft, ArrowRight } from "lucide-react";
import Pagination from "@/components/ui/pagination";

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

interface AllocationHistoryListProps {
  allocations: AllocationHistory[];
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}

export default function AllocationHistoryList({
  allocations,
  currentPage,
  onPageChange,
  itemsPerPage = 10,
}: AllocationHistoryListProps) {
  // Calculate pagination
  const totalItems = allocations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAllocations = allocations.slice(startIndex, endIndex);

  const groupedByDate = paginatedAllocations.reduce((acc, allocation) => {
    const date = format(new Date(allocation.date), "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(allocation);
    return acc;
  }, {} as Record<string, AllocationHistory[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
    b.localeCompare(a)
  );

  if (sortedDates.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No allocation history yet
      </div>
    );
  }

  const getTransferDisplay = (allocation: AllocationHistory) => {
    if (allocation.transferType === "allocation") {
      // New allocation from unallocated funds
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
      // Reallocation between buckets
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

  const getTransferTypeBadge = (transferType: string) => {
    if (transferType === "allocation") {
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

  const getBorderColor = (transferType: string) => {
    return transferType === "allocation" ? "bg-blue-500" : "bg-purple-500";
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
            {groupedByDate[date].map((allocation) => (
              <Card key={allocation.id} className="p-4 flex items-center gap-3">
                <div
                  className={`w-1 h-12 rounded-full ${getBorderColor(
                    allocation.transferType
                  )}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">
                    {allocation.description || "Allocation Transfer"}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    {getTransferDisplay(allocation)}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    {getTransferTypeBadge(allocation.transferType)}
                    <span className="text-xs">
                      {format(new Date(allocation.date), "h:mm a")}
                    </span>
                  </div>
                </div>
                <div className="text-lg font-bold tabular-nums">
                  ${parseFloat(allocation.amount).toFixed(2)}
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
