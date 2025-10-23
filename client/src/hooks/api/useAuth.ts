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
    mutationFn: (userData) => apiClient.register(userData),
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
    mutationFn: (credentials) => apiClient.login(credentials),
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
    mutationFn: () => apiClient.logout(),
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
