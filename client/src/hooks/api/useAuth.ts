import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, type User, type Bucket, type Transaction, type IncomeRecord } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Auth hooks
export const useAuth = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiClient.getCurrentUser(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const registerMutation = useMutation({
    mutationFn: apiClient.register,
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "me"], { user: data.user });
      toast({
        title: "Account created",
        description: "Welcome to Spenny!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: apiClient.login,
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "me"], { user: data.user });
      toast({
        title: "Welcome back",
        description: `Hello ${data.user.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: apiClient.logout,
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "See you next time!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    user: user?.user,
    isLoading,
    error,
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
};

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

// Transaction hooks
export const useTransactions = (options?: { limit?: number; bucketId?: string }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ["transactions", options],
    queryFn: () => apiClient.getTransactions(options),
    select: (data) => data.transactions,
  });

  const createTransactionMutation = useMutation({
    mutationFn: apiClient.createTransaction,
    onSuccess: (data) => {
      // Invalidate buckets to refresh balances
      queryClient.invalidateQueries({ queryKey: ["buckets"] });
      
      // Add transaction to the list
      queryClient.setQueryData(["transactions", options], (old: any) => ({
        transactions: [data.transaction, ...(old?.transactions || [])],
      }));
      
      toast({
        title: "Transaction logged",
        description: `$${data.transaction.amount} spent`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to log transaction",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: apiClient.deleteTransaction,
    onSuccess: (_, transactionId) => {
      // Invalidate buckets to refresh balances
      queryClient.invalidateQueries({ queryKey: ["buckets"] });
      
      // Remove transaction from the list
      queryClient.setQueryData(["transactions", options], (old: any) => ({
        transactions: (old?.transactions || []).filter((t: Transaction) => t.id !== transactionId),
      }));
      
      toast({
        title: "Transaction deleted",
        description: "Transaction has been removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete transaction",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    transactions: transactions || [],
    isLoading,
    error,
    createTransaction: createTransactionMutation.mutate,
    deleteTransaction: deleteTransactionMutation.mutate,
    isCreating: createTransactionMutation.isPending,
    isDeleting: deleteTransactionMutation.isPending,
  };
};

// Income hooks
export const useIncome = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: incomeRecords, isLoading, error } = useQuery({
    queryKey: ["income"],
    queryFn: () => apiClient.getIncomeRecords(),
    select: (data) => data.incomeRecords,
  });

  const createIncomeMutation = useMutation({
    mutationFn: apiClient.createIncomeRecord,
    onSuccess: (data) => {
      queryClient.setQueryData(["income"], (old: any) => ({
        incomeRecords: [data.incomeRecord, ...(old?.incomeRecords || [])],
      }));
      toast({
        title: "Income recorded",
        description: `$${data.incomeRecord.amount} added`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to record income",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    incomeRecords: incomeRecords || [],
    isLoading,
    error,
    createIncome: createIncomeMutation.mutate,
    isCreating: createIncomeMutation.isPending,
  };
};
