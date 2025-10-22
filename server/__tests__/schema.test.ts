import { describe, it, expect } from "vitest";
import { 
  insertUserSchema, 
  insertBucketSchema, 
  insertTransactionSchema, 
  insertIncomeRecordSchema,
  users,
  buckets,
  transactions,
  incomeRecords
} from "@shared/schema";

describe("Database Schema", () => {
  describe("User Schema", () => {
    it("should validate valid user data", () => {
      const validUser = {
        username: "testuser",
        email: "test@example.com",
        name: "Test User",
        password: "password123"
      };

      const result = insertUserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidUser = {
        username: "testuser",
        email: "invalid-email",
        name: "Test User",
        password: "password123"
      };

      const result = insertUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("should reject missing required fields", () => {
      const incompleteUser = {
        username: "testuser",
        email: "test@example.com"
        // missing name and password
      };

      const result = insertUserSchema.safeParse(incompleteUser);
      expect(result.success).toBe(false);
    });
  });

  describe("Bucket Schema", () => {
    it("should validate valid bucket data", () => {
      const validBucket = {
        name: "Groceries",
        iconName: "Shopping",
        allocatedAmount: "500.00",
        currentBalance: "450.00"
      };

      const result = insertBucketSchema.safeParse(validBucket);
      expect(result.success).toBe(true);
    });

    it("should allow optional fields", () => {
      const minimalBucket = {
        name: "Transportation"
        // iconName, allocatedAmount, currentBalance are optional
      };

      const result = insertBucketSchema.safeParse(minimalBucket);
      expect(result.success).toBe(true);
    });
  });

  describe("Transaction Schema", () => {
    it("should validate valid transaction data", () => {
      const validTransaction = {
        bucketId: "bucket-123",
        amount: "25.50",
        description: "Gas station",
        date: new Date()
      };

      const result = insertTransactionSchema.safeParse(validTransaction);
      expect(result.success).toBe(true);
    });

    it("should allow optional description", () => {
      const transactionWithoutDescription = {
        bucketId: "bucket-123",
        amount: "25.50",
        date: new Date()
      };

      const result = insertTransactionSchema.safeParse(transactionWithoutDescription);
      expect(result.success).toBe(true);
    });
  });

  describe("Income Record Schema", () => {
    it("should validate valid income data", () => {
      const validIncome = {
        amount: "2000.00",
        description: "Monthly salary",
        date: new Date()
      };

      const result = insertIncomeRecordSchema.safeParse(validIncome);
      expect(result.success).toBe(true);
    });

    it("should allow optional description", () => {
      const incomeWithoutDescription = {
        amount: "2000.00",
        date: new Date()
      };

      const result = insertIncomeRecordSchema.safeParse(incomeWithoutDescription);
      expect(result.success).toBe(true);
    });
  });

  describe("Table Definitions", () => {
    it("should have correct user table structure", () => {
      expect(users.id.name).toBe("id");
      expect(users.username.name).toBe("username");
      expect(users.email.name).toBe("email");
      expect(users.name.name).toBe("name");
      expect(users.password.name).toBe("password");
      expect(users.googleId.name).toBe("google_id");
      expect(users.createdAt.name).toBe("created_at");
      expect(users.updatedAt.name).toBe("updated_at");
    });

    it("should have correct bucket table structure", () => {
      expect(buckets.id.name).toBe("id");
      expect(buckets.userId.name).toBe("user_id");
      expect(buckets.name.name).toBe("name");
      expect(buckets.iconName.name).toBe("icon_name");
      expect(buckets.allocatedAmount.name).toBe("allocated_amount");
      expect(buckets.currentBalance.name).toBe("current_balance");
      expect(buckets.createdAt.name).toBe("created_at");
      expect(buckets.updatedAt.name).toBe("updated_at");
    });

    it("should have correct transaction table structure", () => {
      expect(transactions.id.name).toBe("id");
      expect(transactions.bucketId.name).toBe("bucket_id");
      expect(transactions.userId.name).toBe("user_id");
      expect(transactions.amount.name).toBe("amount");
      expect(transactions.description.name).toBe("description");
      expect(transactions.date.name).toBe("date");
      expect(transactions.createdAt.name).toBe("created_at");
    });

    it("should have correct income record table structure", () => {
      expect(incomeRecords.id.name).toBe("id");
      expect(incomeRecords.userId.name).toBe("user_id");
      expect(incomeRecords.amount.name).toBe("amount");
      expect(incomeRecords.description.name).toBe("description");
      expect(incomeRecords.date.name).toBe("date");
      expect(incomeRecords.createdAt.name).toBe("created_at");
    });
  });
});
