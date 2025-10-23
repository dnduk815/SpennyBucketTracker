import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import bcrypt from "bcrypt";
import { z } from "zod";
import { storage } from "./storage";
import { 
  requireAuth, 
  validateRequest, 
  errorHandler, 
  asyncHandler 
} from "./middleware";
import { 
  insertUserSchema, 
  insertBucketSchema, 
  insertTransactionSchema, 
  insertIncomeRecordSchema,
  insertAllocationHistorySchema
} from "@shared/schema";

// Validation schemas
const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters")
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const updateBucketSchema = insertBucketSchema.partial();

const updateTransactionSchema = insertTransactionSchema.partial();

const updateIncomeSchema = insertIncomeRecordSchema.partial();

const reallocateFundsSchema = z.object({
  sourceBucketId: z.string(),
  destinationBucketId: z.string().nullable(),
  amount: z.string(),
  transferType: z.enum(['balance', 'allocation']),
  description: z.string().optional().nullable()
});

const allocateFundsSchema = z.object({
  allocations: z.record(z.string(), z.string()), // bucketId -> amount
  description: z.string().optional().nullable()
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", 
    validateRequest(registerSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { username, email, name, password } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists with this email" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(409).json({ message: "Username already taken" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        username,
        email,
        name,
        password: hashedPassword
      });

      res.json({ 
        message: "User registered successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name
        }
      });
    })
  );

  app.post("/api/auth/login", 
    validateRequest(loginSchema),
    passport.authenticate("local", { 
      failureMessage: "Invalid email or password" 
    }),
    (req: Request, res: Response) => {
      res.json({ 
        message: "Login successful",
        user: {
          id: req.user!.id,
          username: req.user!.username,
          email: req.user!.email,
          name: req.user!.name
        }
      });
    }
  );

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/me", requireAuth, (req: Request, res: Response) => {
    res.json({
      user: {
        id: req.user!.id,
        username: req.user!.username,
        email: req.user!.email,
        name: req.user!.name
      }
    });
  });

  app.get("/api/auth/google", 
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get("/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth?error=google" }),
    (req: Request, res: Response) => {
      res.redirect("/");
    }
  );

  // Bucket routes
  app.get("/api/buckets", requireAuth, 
    asyncHandler(async (req: Request, res: Response) => {
      const buckets = await storage.getBucketsByUserId(req.user!.id);
      res.json({ buckets });
    })
  );

  app.post("/api/buckets", requireAuth,
    validateRequest(insertBucketSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const bucket = await storage.createBucket({
        ...req.body,
        userId: req.user!.id
      });
      res.status(201).json({ bucket });
    })
  );

  app.get("/api/buckets/:id", requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      const bucket = await storage.getBucket(req.params.id, req.user!.id);
      if (!bucket) {
        return res.status(404).json({ message: "Bucket not found" });
      }
      res.json({ bucket });
    })
  );

  app.patch("/api/buckets/:id", requireAuth,
    validateRequest(updateBucketSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const bucket = await storage.updateBucket(req.params.id, req.user!.id, req.body);
      res.json({ bucket });
    })
  );

  app.delete("/api/buckets/:id", requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      await storage.deleteBucket(req.params.id, req.user!.id);
      res.json({ message: "Bucket deleted successfully" });
    })
  );

  app.post("/api/buckets/allocate", requireAuth,
    validateRequest(allocateFundsSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { allocations, description } = req.body;
      
      // Validate allocations object
      if (!allocations || typeof allocations !== 'object') {
        return res.status(400).json({ message: "Invalid allocations data" });
      }

      const updatedBuckets = [];
      
      // Process each allocation
      for (const [bucketId, amount] of Object.entries(allocations)) {
        const allocationAmount = parseFloat(amount as string);
        if (isNaN(allocationAmount) || allocationAmount <= 0) {
          continue; // Skip invalid amounts
        }

        // Verify bucket belongs to user
        const bucket = await storage.getBucket(bucketId, req.user!.id);
        if (!bucket) {
          return res.status(404).json({ message: `Bucket ${bucketId} not found` });
        }

        // Update bucket with new allocation
        const newAllocatedAmount = (parseFloat(bucket.allocatedAmount) + allocationAmount).toString();
        const newCurrentBalance = (parseFloat(bucket.currentBalance) + allocationAmount).toString();
        
        const updatedBucket = await storage.updateBucket(bucketId, req.user!.id, {
          allocatedAmount: newAllocatedAmount,
          currentBalance: newCurrentBalance
        });
        
        updatedBuckets.push(updatedBucket);

        // Create allocation history record for each bucket
        await storage.createAllocationHistory({
          userId: req.user!.id,
          sourceBucketId: null, // New allocation from unallocated funds
          destinationBucketId: bucketId,
          amount: allocationAmount.toString(),
          transferType: 'allocation',
          description: description || null,
          date: new Date()
        });
      }

      res.json({ 
        message: "Funds allocated successfully",
        buckets: updatedBuckets
      });
    })
  );

  app.post("/api/buckets/reallocate", requireAuth,
    validateRequest(reallocateFundsSchema),
    asyncHandler(async (req: Request, res: Response) => {
      console.log("Reallocate endpoint called with:", req.body);
      const { sourceBucketId, destinationBucketId, amount, transferType } = req.body;
      
      // Verify source bucket belongs to user
      const sourceBucket = await storage.getBucket(sourceBucketId, req.user!.id);
      if (!sourceBucket) {
        return res.status(404).json({ message: "Source bucket not found" });
      }

      // Verify destination bucket belongs to user (if not null/Unallocated)
      let destinationBucket = null;
      if (destinationBucketId) {
        destinationBucket = await storage.getBucket(destinationBucketId, req.user!.id);
        if (!destinationBucket) {
          return res.status(404).json({ message: "Destination bucket not found" });
        }
      }

      // Validate amount
      const transferAmount = parseFloat(amount);
      if (isNaN(transferAmount) || transferAmount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // Check if source bucket has sufficient funds
      const availableAmount = transferType === 'balance' 
        ? parseFloat(sourceBucket.currentBalance)
        : parseFloat(sourceBucket.allocatedAmount);
      
      if (transferAmount > availableAmount) {
        return res.status(400).json({ 
          message: `Insufficient funds. Available: $${availableAmount.toFixed(2)}` 
        });
      }

      // Perform the reallocation
      try {
        console.log("About to call storage.reallocateFunds");
        const result = await storage.reallocateFunds(
          sourceBucketId,
          destinationBucketId,
          transferAmount,
          transferType,
          req.user!.id
        );
        console.log("Storage reallocateFunds completed successfully:", result);

        // Create allocation history record
        await storage.createAllocationHistory({
          userId: req.user!.id,
          sourceBucketId,
          destinationBucketId,
          amount: transferAmount.toString(),
          transferType: 'reallocation',
          description: req.body.description || null,
          date: new Date()
        });

        res.json({ 
          message: "Funds reallocated successfully",
          buckets: result.buckets
        });
      } catch (error) {
        console.error("Error in reallocation:", error);
        res.status(500).json({ 
          message: "Reallocation failed",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    })
  );

  // Transaction routes
  app.get("/api/transactions", requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const bucketId = req.query.bucketId as string;
      
      let transactions;
      if (bucketId) {
        transactions = await storage.getTransactionsByBucketId(bucketId, req.user!.id);
      } else {
        transactions = await storage.getTransactionsByUserId(req.user!.id, limit);
      }
      
      res.json({ transactions });
    })
  );

  app.post("/api/transactions", requireAuth,
    validateRequest(insertTransactionSchema),
    asyncHandler(async (req: Request, res: Response) => {
      // Verify bucket belongs to user
      const bucket = await storage.getBucket(req.body.bucketId, req.user!.id);
      if (!bucket) {
        return res.status(404).json({ message: "Bucket not found" });
      }

      // Create transaction
      const transaction = await storage.createTransaction({
        ...req.body,
        userId: req.user!.id,
        date: req.body.date || new Date()
      });

      // Update bucket balance
      const newBalance = (parseFloat(bucket.currentBalance) - parseFloat(req.body.amount)).toString();
      await storage.updateBucket(bucket.id, req.user!.id, { 
        currentBalance: newBalance 
      });

      res.status(201).json({ transaction });
    })
  );

  app.delete("/api/transactions/:id", requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      // Get transaction to find bucket
      const transactions = await storage.getTransactionsByUserId(req.user!.id);
      const transaction = transactions.find(t => t.id === req.params.id);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Delete transaction
      await storage.deleteTransaction(req.params.id, req.user!.id);

      // Restore bucket balance
      const bucket = await storage.getBucket(transaction.bucketId, req.user!.id);
      if (bucket) {
        const newBalance = (parseFloat(bucket.currentBalance) + parseFloat(transaction.amount)).toString();
        await storage.updateBucket(bucket.id, req.user!.id, { 
          currentBalance: newBalance 
        });
      }

      res.json({ message: "Transaction deleted successfully" });
    })
  );

  // Income routes
  app.get("/api/income", requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      const incomeRecords = await storage.getIncomeRecordsByUserId(req.user!.id);
      res.json({ incomeRecords });
    })
  );

  app.post("/api/income", requireAuth,
    validateRequest(insertIncomeRecordSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const incomeRecord = await storage.createIncomeRecord({
        ...req.body,
        userId: req.user!.id,
        date: req.body.date || new Date()
      });
      res.status(201).json({ incomeRecord });
    })
  );

  app.delete("/api/income/:id", requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      await storage.deleteIncomeRecord(req.params.id, req.user!.id);
      res.json({ message: "Income record deleted successfully" });
    })
  );

  // Allocation history routes
  app.get("/api/allocations", requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const allocationHistory = await storage.getAllocationHistoryByUserId(req.user!.id, limit);
      res.json({ allocationHistory });
    })
  );

  // User management routes
  app.delete("/api/user/data", requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      const userId = req.user!.id;
      
      // Delete all user's transactions first (to handle MemStorage which doesn't have cascade deletes)
      const transactions = await storage.getTransactionsByUserId(userId);
      for (const transaction of transactions) {
        await storage.deleteTransaction(transaction.id, userId);
      }
      
      // Delete all user's buckets
      const buckets = await storage.getBucketsByUserId(userId);
      for (const bucket of buckets) {
        await storage.deleteBucket(bucket.id, userId);
      }
      
      // Delete all user's income records
      const incomeRecords = await storage.getIncomeRecordsByUserId(userId);
      for (const incomeRecord of incomeRecords) {
        await storage.deleteIncomeRecord(incomeRecord.id, userId);
      }
      
      res.json({ message: "All user data deleted successfully" });
    })
  );

  app.delete("/api/user/account", requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      const userId = req.user!.id;
      
      // First, logout and destroy the session to prevent session serialization errors
      await new Promise<void>((resolve, reject) => {
        req.logout((err: any) => {
          if (err) {
            reject(err);
            return;
          }
          
          // Destroy the session after logout
          req.session.destroy((sessionErr: any) => {
            if (sessionErr) {
              reject(sessionErr);
            } else {
              resolve();
            }
          });
        });
      });
      
      // Now delete all user data
      const transactions = await storage.getTransactionsByUserId(userId);
      for (const transaction of transactions) {
        await storage.deleteTransaction(transaction.id, userId);
      }
      
      const buckets = await storage.getBucketsByUserId(userId);
      for (const bucket of buckets) {
        await storage.deleteBucket(bucket.id, userId);
      }
      
      const incomeRecords = await storage.getIncomeRecordsByUserId(userId);
      for (const incomeRecord of incomeRecords) {
        await storage.deleteIncomeRecord(incomeRecord.id, userId);
      }
      
      // Finally, delete the user account
      await storage.deleteUser(userId);
      
      res.json({ message: "Account deleted successfully" });
    })
  );

  // Error handling middleware
  app.use(errorHandler);

  const httpServer = createServer(app);
  return httpServer;
}
