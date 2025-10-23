import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, type IncomeRecord } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
    mutationFn: (incomeData) => apiClient.createIncomeRecord(incomeData),
    onSuccess: (data) => {
      queryClient.setQueryData(["income"], (old: any) => ({
        incomeRecords: [data.incomeRecord, ...(old?.incomeRecords || [])],
      }));
      const amount = parseFloat(data.incomeRecord.amount);
      const isNegative = amount < 0;
      toast({
        title: isNegative ? "Funds removed" : "Income recorded",
        description: isNegative 
          ? `$${Math.abs(amount).toFixed(2)} removed from unallocated funds`
          : `$${amount.toFixed(2)} added`,
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

  const deleteIncomeMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteIncomeRecord(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(["income"], (old: any) => ({
        incomeRecords: (old?.incomeRecords || []).filter((record: any) => record.id !== deletedId),
      }));
      toast({
        title: "Funds removed",
        description: "Income record deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove funds",
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
    deleteIncome: deleteIncomeMutation.mutate,
    isDeleting: deleteIncomeMutation.isPending,
  };
};
