import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  googleId: text("google_id").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const buckets = pgTable("buckets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  iconName: text("icon_name"),
  allocatedAmount: numeric("allocated_amount", { precision: 10, scale: 2 }).default("0").notNull(),
  currentBalance: numeric("current_balance", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bucketId: varchar("bucket_id").notNull().references(() => buckets.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const incomeRecords = pgTable("income_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const allocationHistory = pgTable("allocation_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sourceBucketId: varchar("source_bucket_id").references(() => buckets.id, { onDelete: "cascade" }),
  destinationBucketId: varchar("destination_bucket_id").references(() => buckets.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  transferType: varchar("transfer_type", { length: 20 }).notNull(), // 'allocation' | 'reallocation'
  description: text("description"),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Session store table for connect-pg-simple
export const userSessions = pgTable("user_sessions", {
  sid: varchar("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  name: true,
  password: true,
});

export const insertBucketSchema = createInsertSchema(buckets).pick({
  name: true,
  iconName: true,
  allocatedAmount: true,
  currentBalance: true,
});

export const insertTransactionSchema = z.object({
  bucketId: z.string(),
  amount: z.string().or(z.number().transform(String)),
  description: z.string().optional().nullable(),
  date: z.coerce.date().optional(),
});

export const insertIncomeRecordSchema = z.object({
  amount: z.string().or(z.number().transform(String)),
  description: z.string().optional().nullable(),
  date: z.coerce.date().optional(),
});

export const insertAllocationHistorySchema = z.object({
  sourceBucketId: z.string().optional().nullable(),
  destinationBucketId: z.string().optional().nullable(),
  amount: z.string().or(z.number().transform(String)),
  transferType: z.enum(['allocation', 'reallocation']),
  description: z.string().optional().nullable(),
  date: z.coerce.date().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBucket = z.infer<typeof insertBucketSchema>;
export type Bucket = typeof buckets.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertIncomeRecord = z.infer<typeof insertIncomeRecordSchema>;
export type IncomeRecord = typeof incomeRecords.$inferSelect;
export type InsertAllocationHistory = z.infer<typeof insertAllocationHistorySchema>;
export type AllocationHistory = typeof allocationHistory.$inferSelect;
