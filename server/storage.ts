import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, desc } from "drizzle-orm";
import { 
  type User, 
  type InsertUser, 
  type Bucket, 
  type InsertBucket,
  type Transaction,
  type InsertTransaction,
  type IncomeRecord,
  type InsertIncomeRecord,
  type AllocationHistory,
  type InsertAllocationHistory,
  users,
  buckets,
  transactions,
  incomeRecords,
  allocationHistory
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Bucket operations
  getBucketsByUserId(userId: string): Promise<Bucket[]>;
  getBucket(id: string, userId: string): Promise<Bucket | undefined>;
  createBucket(bucket: InsertBucket & { userId: string }): Promise<Bucket>;
  updateBucket(id: string, userId: string, updates: Partial<Bucket>): Promise<Bucket>;
  deleteBucket(id: string, userId: string): Promise<void>;

  // Transaction operations
  getTransactionsByUserId(userId: string, limit?: number): Promise<Transaction[]>;
  getTransactionsByBucketId(bucketId: string, userId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction & { userId: string }): Promise<Transaction>;
  deleteTransaction(id: string, userId: string): Promise<void>;

  // Income operations
  getIncomeRecordsByUserId(userId: string): Promise<IncomeRecord[]>;
  createIncomeRecord(income: InsertIncomeRecord & { userId: string }): Promise<IncomeRecord>;
  deleteIncomeRecord(id: string, userId: string): Promise<void>;

  // Allocation history operations
  getAllocationHistoryByUserId(userId: string, limit?: number): Promise<AllocationHistory[]>;
  createAllocationHistory(allocation: InsertAllocationHistory & { userId: string }): Promise<AllocationHistory>;

  // User management operations
  deleteUser(id: string): Promise<void>;

  // Fund reallocation operations
  reallocateFunds(
    sourceBucketId: string,
    destinationBucketId: string | null,
    amount: number,
    transferType: 'balance' | 'allocation',
    userId: string
  ): Promise<{ buckets: Bucket[] }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private buckets: Map<string, Bucket>;
  private transactions: Map<string, Transaction>;
  private incomeRecords: Map<string, IncomeRecord>;
  private allocationHistory: Map<string, AllocationHistory>;

  constructor() {
    this.users = new Map();
    this.buckets = new Map();
    this.transactions = new Map();
    this.incomeRecords = new Map();
    this.allocationHistory = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = crypto.randomUUID();
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      googleId: null,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    
    // Create default buckets for new user
    await this.createDefaultBuckets(id);
    
    return user;
  }

  private async createDefaultBuckets(userId: string): Promise<void> {
    const defaultBuckets = [
      { name: "Groceries", iconName: "Shopping" },
      { name: "Transportation", iconName: "Transportation" },
      { name: "Entertainment", iconName: "Entertainment" },
      { name: "Dining Out", iconName: "Dining" }
    ];

    for (const bucket of defaultBuckets) {
      await this.createBucket({
        userId,
        name: bucket.name,
        iconName: bucket.iconName,
        allocatedAmount: "0",
        currentBalance: "0"
      });
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getBucketsByUserId(userId: string): Promise<Bucket[]> {
    return Array.from(this.buckets.values()).filter(
      (bucket) => bucket.userId === userId
    );
  }

  async getBucket(id: string, userId: string): Promise<Bucket | undefined> {
    const bucket = this.buckets.get(id);
    return bucket && bucket.userId === userId ? bucket : undefined;
  }

  async createBucket(bucket: InsertBucket & { userId: string }): Promise<Bucket> {
    const id = crypto.randomUUID();
    const now = new Date();
    const newBucket: Bucket = {
      id,
      userId: bucket.userId,
      name: bucket.name,
      iconName: bucket.iconName || null,
      allocatedAmount: bucket.allocatedAmount || "0",
      currentBalance: bucket.currentBalance || "0",
      createdAt: now,
      updatedAt: now
    };
    this.buckets.set(id, newBucket);
    return newBucket;
  }

  async updateBucket(id: string, userId: string, updates: Partial<Bucket>): Promise<Bucket> {
    const bucket = this.buckets.get(id);
    if (!bucket || bucket.userId !== userId) throw new Error("Bucket not found");
    
    const updatedBucket = { ...bucket, ...updates, updatedAt: new Date() };
    this.buckets.set(id, updatedBucket);
    return updatedBucket;
  }

  async deleteBucket(id: string, userId: string): Promise<void> {
    const bucket = this.buckets.get(id);
    if (!bucket || bucket.userId !== userId) throw new Error("Bucket not found");
    this.buckets.delete(id);
  }

  async getTransactionsByUserId(userId: string, limit?: number): Promise<Transaction[]> {
    const userTransactions = Array.from(this.transactions.values())
      .filter((transaction) => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return limit ? userTransactions.slice(0, limit) : userTransactions;
  }

  async getTransactionsByBucketId(bucketId: string, userId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.bucketId === bucketId && transaction.userId === userId
    );
  }

  async createTransaction(transaction: InsertTransaction & { userId: string }): Promise<Transaction> {
    const id = crypto.randomUUID();
    const now = new Date();
    const newTransaction: Transaction = {
      id,
      bucketId: transaction.bucketId,
      userId: transaction.userId,
      amount: transaction.amount,
      description: transaction.description || null,
      date: transaction.date || now,
      createdAt: now
    };
    
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async deleteTransaction(id: string, userId: string): Promise<void> {
    const transaction = this.transactions.get(id);
    if (!transaction || transaction.userId !== userId) throw new Error("Transaction not found");
    this.transactions.delete(id);
  }

  async getIncomeRecordsByUserId(userId: string): Promise<IncomeRecord[]> {
    return Array.from(this.incomeRecords.values())
      .filter((income) => income.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createIncomeRecord(income: InsertIncomeRecord & { userId: string }): Promise<IncomeRecord> {
    const id = crypto.randomUUID();
    const now = new Date();
    const newIncome: IncomeRecord = {
      id,
      userId: income.userId,
      amount: income.amount,
      description: income.description || null,
      date: income.date || now,
      createdAt: now
    };
    this.incomeRecords.set(id, newIncome);
    return newIncome;
  }

  async deleteIncomeRecord(id: string, userId: string): Promise<void> {
    const incomeRecord = this.incomeRecords.get(id);
    if (!incomeRecord || incomeRecord.userId !== userId) throw new Error("Income record not found");
    this.incomeRecords.delete(id);
  }

  async getAllocationHistoryByUserId(userId: string, limit?: number): Promise<AllocationHistory[]> {
    const userAllocations = Array.from(this.allocationHistory.values())
      .filter((allocation) => allocation.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return limit ? userAllocations.slice(0, limit) : userAllocations;
  }

  async createAllocationHistory(allocation: InsertAllocationHistory & { userId: string }): Promise<AllocationHistory> {
    const id = crypto.randomUUID();
    const now = new Date();
    const newAllocation: AllocationHistory = {
      id,
      userId: allocation.userId,
      sourceBucketId: allocation.sourceBucketId || null,
      destinationBucketId: allocation.destinationBucketId || null,
      amount: allocation.amount,
      transferType: allocation.transferType,
      description: allocation.description || null,
      date: allocation.date || now,
      createdAt: now
    };
    this.allocationHistory.set(id, newAllocation);
    return newAllocation;
  }

  async deleteUser(id: string): Promise<void> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    this.users.delete(id);
  }

  async reallocateFunds(
    sourceBucketId: string,
    destinationBucketId: string | null,
    amount: number,
    transferType: 'balance' | 'allocation',
    userId: string
  ): Promise<{ buckets: Bucket[] }> {
    console.log("MemStorage reallocateFunds called with:", { sourceBucketId, destinationBucketId, amount, transferType, userId });
    
    // Get source bucket
    const sourceBucket = this.buckets.get(sourceBucketId);
    if (!sourceBucket || sourceBucket.userId !== userId) {
      throw new Error("Source bucket not found");
    }

    // Get destination bucket if specified
    let destinationBucket: Bucket | null = null;
    if (destinationBucketId) {
      const bucket = this.buckets.get(destinationBucketId);
      if (!bucket || bucket.userId !== userId) {
        throw new Error("Destination bucket not found");
      }
      destinationBucket = bucket;
    }

    // Perform the transfer
    const updatedBuckets: Bucket[] = [];

    if (transferType === 'balance') {
      // Balance transfer: move currentBalance only
      const newSourceBalance = (parseFloat(sourceBucket.currentBalance) - amount).toString();
      const updatedSource = { ...sourceBucket, currentBalance: newSourceBalance, updatedAt: new Date() };
      this.buckets.set(sourceBucketId, updatedSource);
      updatedBuckets.push(updatedSource);

      if (destinationBucket && destinationBucketId) {
        // Transfer to another bucket
        const newDestBalance = (parseFloat(destinationBucket.currentBalance) + amount).toString();
        const updatedDest = { ...destinationBucket, currentBalance: newDestBalance, updatedAt: new Date() };
        this.buckets.set(destinationBucketId, updatedDest);
        updatedBuckets.push(updatedDest);
      } else {
        // Transfer to "Unallocated" - reduce allocatedAmount to make funds available for new allocation
        const newSourceAllocated = (parseFloat(sourceBucket.allocatedAmount) - amount).toString();
        const updatedSourceAllocated = { ...updatedSource, allocatedAmount: newSourceAllocated, updatedAt: new Date() };
        this.buckets.set(sourceBucketId, updatedSourceAllocated);
        updatedBuckets[0] = updatedSourceAllocated; // Update the first bucket in the array
      }
    } else {
      // Allocation transfer: move both allocatedAmount and currentBalance
      const newSourceAllocated = (parseFloat(sourceBucket.allocatedAmount) - amount).toString();
      const newSourceBalance = (parseFloat(sourceBucket.currentBalance) - amount).toString();
      const updatedSource = { 
        ...sourceBucket, 
        allocatedAmount: newSourceAllocated,
        currentBalance: newSourceBalance, 
        updatedAt: new Date() 
      };
      this.buckets.set(sourceBucketId, updatedSource);
      updatedBuckets.push(updatedSource);

      if (destinationBucket && destinationBucketId) {
        const newDestAllocated = (parseFloat(destinationBucket.allocatedAmount) + amount).toString();
        const newDestBalance = (parseFloat(destinationBucket.currentBalance) + amount).toString();
        const updatedDest = { 
          ...destinationBucket, 
          allocatedAmount: newDestAllocated,
          currentBalance: newDestBalance, 
          updatedAt: new Date() 
        };
        this.buckets.set(destinationBucketId, updatedDest);
        updatedBuckets.push(updatedDest);
      }
    }

    return { buckets: updatedBuckets };
  }
}

export class DbStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.googleId, googleId)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    const newUser = result[0];
    
    // Create default buckets for new user
    await this.createDefaultBuckets(newUser.id);
    
    return newUser;
  }

  private async createDefaultBuckets(userId: string): Promise<void> {
    const defaultBuckets = [
      { name: "Groceries", iconName: "Shopping" },
      { name: "Transportation", iconName: "Transportation" },
      { name: "Entertainment", iconName: "Entertainment" },
      { name: "Dining Out", iconName: "Dining" }
    ];

    for (const bucket of defaultBuckets) {
      await this.createBucket({
        userId,
        name: bucket.name,
        iconName: bucket.iconName,
        allocatedAmount: "0",
        currentBalance: "0"
      });
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const result = await this.db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error("User not found");
    }
    return result[0];
  }

  // Bucket operations
  async getBucketsByUserId(userId: string): Promise<Bucket[]> {
    return await this.db.select().from(buckets).where(eq(buckets.userId, userId));
  }

  async getBucket(id: string, userId: string): Promise<Bucket | undefined> {
    const result = await this.db
      .select()
      .from(buckets)
      .where(and(eq(buckets.id, id), eq(buckets.userId, userId)))
      .limit(1);
    return result[0];
  }

  async createBucket(bucket: InsertBucket & { userId: string }): Promise<Bucket> {
    const result = await this.db.insert(buckets).values(bucket).returning();
    return result[0];
  }

  async updateBucket(id: string, userId: string, updates: Partial<Bucket>): Promise<Bucket> {
    const result = await this.db
      .update(buckets)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(buckets.id, id), eq(buckets.userId, userId)))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Bucket not found");
    }
    return result[0];
  }

  async deleteBucket(id: string, userId: string): Promise<void> {
    const result = await this.db
      .delete(buckets)
      .where(and(eq(buckets.id, id), eq(buckets.userId, userId)))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Bucket not found");
    }
  }

  // Transaction operations
  async getTransactionsByUserId(userId: string, limit?: number): Promise<Transaction[]> {
    const query = this.db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
    
    if (limit) {
      return await query.limit(limit);
    }
    
    return await query;
  }

  async getTransactionsByBucketId(bucketId: string, userId: string): Promise<Transaction[]> {
    return await this.db
      .select()
      .from(transactions)
      .where(and(eq(transactions.bucketId, bucketId), eq(transactions.userId, userId)))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction & { userId: string }): Promise<Transaction> {
    const result = await this.db.insert(transactions).values(transaction).returning();
    return result[0];
  }

  async deleteTransaction(id: string, userId: string): Promise<void> {
    const result = await this.db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Transaction not found");
    }
  }

  // Income operations
  async getIncomeRecordsByUserId(userId: string): Promise<IncomeRecord[]> {
    return await this.db
      .select()
      .from(incomeRecords)
      .where(eq(incomeRecords.userId, userId))
      .orderBy(desc(incomeRecords.createdAt));
  }

  async createIncomeRecord(income: InsertIncomeRecord & { userId: string }): Promise<IncomeRecord> {
    const result = await this.db.insert(incomeRecords).values(income).returning();
    return result[0];
  }

  async deleteIncomeRecord(id: string, userId: string): Promise<void> {
    const result = await this.db
      .delete(incomeRecords)
      .where(and(eq(incomeRecords.id, id), eq(incomeRecords.userId, userId)));
    
    if (result.rowCount === 0) {
      throw new Error("Income record not found");
    }
  }

  async getAllocationHistoryByUserId(userId: string, limit?: number): Promise<AllocationHistory[]> {
    const query = this.db
      .select()
      .from(allocationHistory)
      .where(eq(allocationHistory.userId, userId))
      .orderBy(desc(allocationHistory.createdAt));
    
    if (limit) {
      return await query.limit(limit);
    }
    
    return await query;
  }

  async createAllocationHistory(allocation: InsertAllocationHistory & { userId: string }): Promise<AllocationHistory> {
    const result = await this.db.insert(allocationHistory).values(allocation).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.db
      .delete(users)
      .where(eq(users.id, id));
    
    if (result.rowCount === 0) {
      throw new Error("User not found");
    }
  }

  async reallocateFunds(
    sourceBucketId: string,
    destinationBucketId: string | null,
    amount: number,
    transferType: 'balance' | 'allocation',
    userId: string
  ): Promise<{ buckets: Bucket[] }> {
    // Get source bucket
    const sourceBucket = await this.getBucket(sourceBucketId, userId);
    if (!sourceBucket) {
      throw new Error("Source bucket not found");
    }

    // Get destination bucket if specified
    let destinationBucket: Bucket | null = null;
    if (destinationBucketId) {
      const bucket = await this.getBucket(destinationBucketId, userId);
      if (!bucket) {
        throw new Error("Destination bucket not found");
      }
      destinationBucket = bucket;
    }

    const updatedBuckets: Bucket[] = [];

    if (transferType === 'balance') {
      // Balance transfer: move currentBalance only
      const newSourceBalance = (parseFloat(sourceBucket.currentBalance) - amount).toString();
      
      if (destinationBucket && destinationBucketId) {
        // Transfer to another bucket
        const newDestBalance = (parseFloat(destinationBucket.currentBalance) + amount).toString();
        const updatedSource = await this.updateBucket(sourceBucketId, userId, { 
          currentBalance: newSourceBalance 
        });
        const updatedDest = await this.updateBucket(destinationBucketId, userId, { 
          currentBalance: newDestBalance 
        });
        updatedBuckets.push(updatedSource);
        updatedBuckets.push(updatedDest);
      } else {
        // Transfer to "Unallocated" - reduce allocatedAmount to make funds available for new allocation
        const newSourceAllocated = (parseFloat(sourceBucket.allocatedAmount) - amount).toString();
        const updatedSource = await this.updateBucket(sourceBucketId, userId, { 
          currentBalance: newSourceBalance,
          allocatedAmount: newSourceAllocated
        });
        updatedBuckets.push(updatedSource);
      }
    } else {
      // Allocation transfer: move both allocatedAmount and currentBalance
      const newSourceAllocated = (parseFloat(sourceBucket.allocatedAmount) - amount).toString();
      const newSourceBalance = (parseFloat(sourceBucket.currentBalance) - amount).toString();
      const updatedSource = await this.updateBucket(sourceBucketId, userId, { 
        allocatedAmount: newSourceAllocated,
        currentBalance: newSourceBalance 
      });
      updatedBuckets.push(updatedSource);

      if (destinationBucket && destinationBucketId) {
        const newDestAllocated = (parseFloat(destinationBucket.allocatedAmount) + amount).toString();
        const newDestBalance = (parseFloat(destinationBucket.currentBalance) + amount).toString();
        const updatedDest = await this.updateBucket(destinationBucketId, userId, { 
          allocatedAmount: newDestAllocated,
          currentBalance: newDestBalance 
        });
        updatedBuckets.push(updatedDest);
      }
    }

    return { buckets: updatedBuckets };
  }
}

// Use DbStorage in production, MemStorage for testing or when DATABASE_URL is not available
export const storage = process.env.NODE_ENV === "test" || !process.env.DATABASE_URL
  ? new MemStorage() 
  : new DbStorage();
