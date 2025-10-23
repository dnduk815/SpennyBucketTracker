// API client with TypeScript types
import { User, Bucket, Transaction, IncomeRecord } from "@shared/schema";

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  user: Omit<User, 'password' | 'googleId'>;
  message: string;
}

export interface BucketsResponse {
  buckets: Bucket[];
}

export interface BucketResponse {
  bucket: Bucket;
}

export interface TransactionsResponse {
  transactions: Transaction[];
}

export interface TransactionResponse {
  transaction: Transaction;
}

export interface IncomeResponse {
  incomeRecords: IncomeRecord[];
}

export interface IncomeRecordResponse {
  incomeRecord: IncomeRecord;
}

export interface ReallocateFundsResponse {
  message: string;
  buckets: Bucket[];
}

// API Client class
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session management
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Check content type to determine if response is JSON
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      if (!response.ok) {
        if (isJson) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}`);
        } else {
          // Response is not JSON (probably HTML error page)
          const text = await response.text();
          console.error('Non-JSON error response:', text.substring(0, 200));
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      if (isJson) {
        return await response.json();
      } else {
        // This shouldn't happen for successful responses, but handle it gracefully
        const text = await response.text();
        console.error('Non-JSON success response:', text.substring(0, 200));
        throw new Error('Expected JSON response but received HTML');
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData: {
    username: string;
    email: string;
    name: string;
    password: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<{ user: Omit<User, 'password' | 'googleId'> }> {
    return this.request<{ user: Omit<User, 'password' | 'googleId'> }>('/auth/me');
  }

  // Bucket methods
  async getBuckets(): Promise<BucketsResponse> {
    return this.request<BucketsResponse>('/buckets');
  }

  async createBucket(bucketData: {
    name: string;
    iconName?: string;
    allocatedAmount?: string;
    currentBalance?: string;
  }): Promise<BucketResponse> {
    return this.request<BucketResponse>('/buckets', {
      method: 'POST',
      body: JSON.stringify(bucketData),
    });
  }

  async getBucket(id: string): Promise<BucketResponse> {
    return this.request<BucketResponse>(`/buckets/${id}`);
  }

  async updateBucket(id: string, updates: Partial<Bucket>): Promise<BucketResponse> {
    return this.request<BucketResponse>(`/buckets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteBucket(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/buckets/${id}`, {
      method: 'DELETE',
    });
  }

  // Transaction methods
  async getTransactions(options?: {
    limit?: number;
    bucketId?: string;
  }): Promise<TransactionsResponse> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.bucketId) params.append('bucketId', options.bucketId);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/transactions?${queryString}` : '/transactions';
    
    return this.request<TransactionsResponse>(endpoint);
  }

  async createTransaction(transactionData: {
    bucketId: string;
    amount: string;
    description?: string;
    date?: string;
  }): Promise<TransactionResponse> {
    return this.request<TransactionResponse>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async deleteTransaction(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // Income methods
  async getIncomeRecords(): Promise<IncomeResponse> {
    return this.request<IncomeResponse>('/income');
  }

  async createIncomeRecord(incomeData: {
    amount: string;
    description?: string;
    date?: Date;
  }): Promise<IncomeRecordResponse> {
    return this.request<IncomeRecordResponse>('/income', {
      method: 'POST',
      body: JSON.stringify(incomeData),
    });
  }

  async deleteIncomeRecord(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/income/${id}`, {
      method: 'DELETE',
    });
  }

  // Allocation history methods
  async getAllocationHistory(options?: {
    limit?: number;
  }): Promise<{ allocationHistory: any[] }> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/allocations?${queryString}` : '/allocations';
    
    return this.request<{ allocationHistory: any[] }>(endpoint);
  }

  // Fund reallocation methods
  async reallocateFunds(reallocationData: {
    sourceBucketId: string;
    destinationBucketId: string | null;
    amount: string;
    transferType: 'balance' | 'allocation';
  }): Promise<ReallocateFundsResponse> {
    return this.request<ReallocateFundsResponse>('/buckets/reallocate', {
      method: 'POST',
      body: JSON.stringify(reallocationData),
    });
  }

  async allocateFunds(allocationData: {
    allocations: Record<string, string>;
    description?: string;
  }): Promise<{ message: string; buckets: Bucket[] }> {
    return this.request<{ message: string; buckets: Bucket[] }>('/buckets/allocate', {
      method: 'POST',
      body: JSON.stringify(allocationData),
    });
  }

  // User management methods
  async deleteAllUserData(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/user/data', {
      method: 'DELETE',
    });
  }

  async deleteAccount(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/user/account', {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types for use in components
export type {
  User,
  Bucket,
  Transaction,
  IncomeRecord,
  AuthResponse,
  BucketsResponse,
  BucketResponse,
  TransactionsResponse,
  TransactionResponse,
  IncomeResponse,
  IncomeRecordResponse,
  ReallocateFundsResponse,
};
