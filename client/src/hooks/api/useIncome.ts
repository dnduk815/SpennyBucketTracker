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
