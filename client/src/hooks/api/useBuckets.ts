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
    mutationFn: apiClient.createBucket,
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
    mutationFn: apiClient.deleteBucket,
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

  return {
    buckets: buckets || [],
    isLoading,
    error,
    createBucket: createBucketMutation.mutate,
    updateBucket: updateBucketMutation.mutate,
    deleteBucket: deleteBucketMutation.mutate,
    isCreating: createBucketMutation.isPending,
    isUpdating: updateBucketMutation.isPending,
    isDeleting: deleteBucketMutation.isPending,
  };
};
