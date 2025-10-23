import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, type Bucket } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Bucket hooks
export const useBuckets = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: buckets, isLoading, error } = useQuery({
    queryKey: ["buckets"],
    queryFn: () => apiClient.getBuckets(),
    select: (data) => data.buckets,
  });

  const createBucketMutation = useMutation({
    mutationFn: (bucketData) => apiClient.createBucket(bucketData),
    onSuccess: (data) => {
      queryClient.setQueryData(["buckets"], (old: any) => ({
        buckets: [...(old?.buckets || []), data.bucket],
      }));
      toast({
        title: "Bucket created",
        description: `${data.bucket.name} is ready for allocation`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create bucket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateBucketMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Bucket> }) =>
      apiClient.updateBucket(id, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(["buckets"], (old: any) => ({
        buckets: (old?.buckets || []).map((bucket: Bucket) =>
          bucket.id === data.bucket.id ? data.bucket : bucket
        ),
      }));
      toast({
        title: "Bucket updated",
        description: `${data.bucket.name} has been updated`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update bucket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBucketMutation = useMutation({
    mutationFn: (bucketId: string) => apiClient.deleteBucket(bucketId),
    onSuccess: (_, bucketId) => {
      queryClient.setQueryData(["buckets"], (old: any) => ({
        buckets: (old?.buckets || []).filter((bucket: Bucket) => bucket.id !== bucketId),
      }));
      toast({
        title: "Bucket deleted",
        description: "Bucket has been removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete bucket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const reallocateFundsMutation = useMutation({
    mutationFn: (reallocationData: {
      sourceBucketId: string;
      destinationBucketId: string | null;
      amount: string;
      transferType: 'balance' | 'allocation';
    }) => apiClient.reallocateFunds(reallocationData),
    onSuccess: (data) => {
      // Update the buckets cache with the returned updated buckets
      queryClient.setQueryData(["buckets"], (old: any) => {
        const updatedBuckets = [...(old?.buckets || [])];
        data.buckets.forEach(updatedBucket => {
          const index = updatedBuckets.findIndex((bucket: Bucket) => bucket.id === updatedBucket.id);
          if (index !== -1) {
            updatedBuckets[index] = updatedBucket;
          }
        });
        return { buckets: updatedBuckets };
      });
      toast({
        title: "Funds reallocated",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reallocate funds",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const allocateFundsMutation = useMutation({
    mutationFn: (allocationData: {
      allocations: Record<string, string>;
      description?: string;
    }) => apiClient.allocateFunds(allocationData),
    onSuccess: (data) => {
      // Update buckets cache
      queryClient.setQueryData(["buckets"], (old: any) => {
        const updatedBuckets = [...(old?.buckets || [])];
        data.buckets.forEach(updatedBucket => {
          const index = updatedBuckets.findIndex((bucket: Bucket) => bucket.id === updatedBucket.id);
          if (index !== -1) {
            updatedBuckets[index] = updatedBucket;
          }
        });
        return { buckets: updatedBuckets };
      });
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      toast({
        title: "Funds allocated",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to allocate funds",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    buckets: buckets || [],
    isLoading,
    error,
    createBucket: createBucketMutation.mutate,
    updateBucket: updateBucketMutation.mutate,
    deleteBucket: deleteBucketMutation.mutate,
    reallocateFunds: reallocateFundsMutation.mutate,
    allocateFunds: allocateFundsMutation.mutate,
    isCreating: createBucketMutation.isPending,
    isUpdating: updateBucketMutation.isPending,
    isDeleting: deleteBucketMutation.isPending,
    isReallocating: reallocateFundsMutation.isPending,
    isAllocating: allocateFundsMutation.isPending,
  };
};
