import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

interface AllocationHistory {
  id: string;
  userId: string;
  sourceBucketId: string | null;
  destinationBucketId: string | null;
  amount: string;
  transferType: 'allocation' | 'reallocation';
  description: string | null;
  date: string;
  createdAt: string;
}

interface AllocationHistoryWithNames extends AllocationHistory {
  sourceBucketName?: string;
  destinationBucketName?: string;
}

interface UseAllocationsOptions {
  limit?: number;
}

export function useAllocations(options: UseAllocationsOptions = {}) {
  const { limit = 50 } = options;

  return useQuery({
    queryKey: ["allocations", limit],
    queryFn: async (): Promise<AllocationHistoryWithNames[]> => {
      const [allocationsResponse, bucketsResponse] = await Promise.all([
        apiClient.getAllocationHistory({ limit }),
        apiClient.getBuckets()
      ]);
      
      const allocations = allocationsResponse.allocationHistory;
      const buckets = bucketsResponse.buckets;
      
      // Create a map of bucket IDs to names
      const bucketMap = new Map(buckets.map((bucket: any) => [bucket.id, bucket.name]));
      
      // Enrich allocation history with bucket names
      return allocations.map((allocation: AllocationHistory) => ({
        ...allocation,
        sourceBucketName: allocation.sourceBucketId ? bucketMap.get(allocation.sourceBucketId) : undefined,
        destinationBucketName: allocation.destinationBucketId ? bucketMap.get(allocation.destinationBucketId) : undefined,
      }));
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}
