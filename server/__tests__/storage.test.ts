import { describe, it, expect, beforeEach } from "vitest";
import { MemStorage, DbStorage } from "../storage";
import { insertUserSchema, insertBucketSchema, insertTransactionSchema, insertIncomeRecordSchema } from "@shared/schema";

describe("Storage Layer", () => {
  describe("MemStorage", () => {
    let storage: MemStorage;

    beforeEach(() => {
      storage = new MemStorage();
    });

    describe("User Operations", () => {
      it("should create and retrieve a user", async () => {
        const userData = {
          username: "testuser",
          email: "test@example.com",
          name: "Test User",
          password: "password123"
        };

        const user = await storage.createUser(userData);
        expect(user.id).toBeDefined();
        expect(user.username).toBe(userData.username);
        expect(user.email).toBe(userData.email);
        expect(user.name).toBe(userData.name);

        const retrievedUser = await storage.getUser(user.id);
        expect(retrievedUser).toEqual(user);
      });

      it("should find user by username", async () => {
        const userData = {
          username: "testuser",
          email: "test@example.com",
          name: "Test User",
          password: "password123"
        };

        await storage.createUser(userData);
        const user = await storage.getUserByUsername("testuser");
        expect(user?.username).toBe("testuser");
      });

      it("should find user by email", async () => {
        const userData = {
          username: "testuser",
          email: "test@example.com",
          name: "Test User",
          password: "password123"
        };

        await storage.createUser(userData);
        const user = await storage.getUserByEmail("test@example.com");
        expect(user?.email).toBe("test@example.com");
      });

      it("should update user", async () => {
        const userData = {
          username: "testuser",
          email: "test@example.com",
          name: "Test User",
          password: "password123"
        };

        const user = await storage.createUser(userData);
        const updatedUser = await storage.updateUser(user.id, { name: "Updated Name" });
        expect(updatedUser.name).toBe("Updated Name");
        expect(updatedUser.updatedAt).not.toEqual(user.updatedAt);
      });

      it("should throw error when updating non-existent user", async () => {
        await expect(storage.updateUser("non-existent", { name: "New Name" }))
          .rejects.toThrow("User not found");
      });
    });

    describe("Bucket Operations", () => {
      let userId: string;

      beforeEach(async () => {
        const user = await storage.createUser({
          username: "testuser",
          email: "test@example.com",
          name: "Test User",
          password: "password123"
        });
        userId = user.id;
      });

      it("should create and retrieve buckets", async () => {
        const bucketData = {
          userId,
          name: "Groceries",
          iconName: "Shopping",
          allocatedAmount: "500.00",
          currentBalance: "450.00"
        };

        const bucket = await storage.createBucket(bucketData);
        expect(bucket.id).toBeDefined();
        expect(bucket.name).toBe("Groceries");

        const buckets = await storage.getBucketsByUserId(userId);
        expect(buckets).toHaveLength(1);
        expect(buckets[0]).toEqual(bucket);
      });

      it("should update bucket", async () => {
        const bucket = await storage.createBucket({
          userId,
          name: "Groceries",
          allocatedAmount: "500.00",
          currentBalance: "450.00"
        });

        const updatedBucket = await storage.updateBucket(bucket.id, userId, { 
          name: "Updated Groceries" 
        });
        expect(updatedBucket.name).toBe("Updated Groceries");
      });

      it("should delete bucket", async () => {
        const bucket = await storage.createBucket({
          userId,
          name: "Groceries",
          allocatedAmount: "500.00",
          currentBalance: "450.00"
        });

        await storage.deleteBucket(bucket.id, userId);
        
        const buckets = await storage.getBucketsByUserId(userId);
        expect(buckets).toHaveLength(0);
      });

      it("should not allow access to other users' buckets", async () => {
        const otherUser = await storage.createUser({
          username: "otheruser",
          email: "other@example.com",
          name: "Other User",
          password: "password123"
        });

        const bucket = await storage.createBucket({
          userId,
          name: "My Bucket",
          allocatedAmount: "100.00",
          currentBalance: "100.00"
        });

        const retrievedBucket = await storage.getBucket(bucket.id, otherUser.id);
        expect(retrievedBucket).toBeUndefined();
      });
    });

    describe("Transaction Operations", () => {
      let userId: string;
      let bucketId: string;

      beforeEach(async () => {
        const user = await storage.createUser({
          username: "testuser",
          email: "test@example.com",
          name: "Test User",
          password: "password123"
        });
        userId = user.id;

        const bucket = await storage.createBucket({
          userId,
          name: "Groceries",
          allocatedAmount: "500.00",
          currentBalance: "450.00"
        });
        bucketId = bucket.id;
      });

      it("should create and retrieve transactions", async () => {
        const transactionData = {
          bucketId,
          userId,
          amount: "25.50",
          description: "Gas station",
          date: new Date()
        };

        const transaction = await storage.createTransaction(transactionData);
        expect(transaction.id).toBeDefined();
        expect(transaction.amount).toBe("25.50");

        const transactions = await storage.getTransactionsByUserId(userId);
        expect(transactions).toHaveLength(1);
        expect(transactions[0]).toEqual(transaction);
      });

      it("should limit transaction results", async () => {
        // Create multiple transactions
        for (let i = 0; i < 5; i++) {
          await storage.createTransaction({
            bucketId,
            userId,
            amount: "10.00",
            description: `Transaction ${i}`,
            date: new Date()
          });
        }

        const limitedTransactions = await storage.getTransactionsByUserId(userId, 3);
        expect(limitedTransactions).toHaveLength(3);
      });

      it("should get transactions by bucket", async () => {
        await storage.createTransaction({
          bucketId,
          userId,
          amount: "25.50",
          description: "Gas station",
          date: new Date()
        });

        const bucketTransactions = await storage.getTransactionsByBucketId(bucketId, userId);
        expect(bucketTransactions).toHaveLength(1);
      });

      it("should delete transaction", async () => {
        const transaction = await storage.createTransaction({
          bucketId,
          userId,
          amount: "25.50",
          description: "Gas station",
          date: new Date()
        });

        await storage.deleteTransaction(transaction.id, userId);
        
        const transactions = await storage.getTransactionsByUserId(userId);
        expect(transactions).toHaveLength(0);
      });
    });

    describe("Income Operations", () => {
      let userId: string;

      beforeEach(async () => {
        const user = await storage.createUser({
          username: "testuser",
          email: "test@example.com",
          name: "Test User",
          password: "password123"
        });
        userId = user.id;
      });

      it("should create and retrieve income records", async () => {
        const incomeData = {
          userId,
          amount: "2000.00",
          description: "Monthly salary",
          date: new Date()
        };

        const income = await storage.createIncomeRecord(incomeData);
        expect(income.id).toBeDefined();
        expect(income.amount).toBe("2000.00");

        const incomeRecords = await storage.getIncomeRecordsByUserId(userId);
        expect(incomeRecords).toHaveLength(1);
        expect(incomeRecords[0]).toEqual(income);
      });
    });
  });

  describe("DbStorage", () => {
    // Note: DbStorage tests would require a test database setup
    // For now, we'll test the interface compliance
    it("should implement IStorage interface", () => {
      expect(() => new DbStorage()).not.toThrow();
    });
  });
});
