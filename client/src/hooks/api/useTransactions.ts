import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, type Transaction } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
