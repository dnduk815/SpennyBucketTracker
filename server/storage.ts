import { drizzle } from "drizzle-orm/neon-serverless";
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
  users,
  buckets,
  transactions,
  incomeRecords
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private buckets: Map<string, Bucket>;
  private transactions: Map<string, Transaction>;
  private incomeRecords: Map<string, IncomeRecord>;

  constructor() {
    this.users = new Map();
    this.buckets = new Map();
    this.transactions = new Map();
    this.incomeRecords = new Map();
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
    return user;
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
    return result[0];
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
    let query = this.db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
    
    if (limit) {
      query = query.limit(limit);
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
}

// Use DbStorage in production, MemStorage for testing
export const storage = process.env.NODE_ENV === "test" 
  ? new MemStorage() 
  : new DbStorage();
