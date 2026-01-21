import { pgTable, text, serial, integer, boolean, timestamp, numeric, varchar, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Export auth tables
export * from "./models/auth";
import { users } from "./models/auth";

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isExternal: boolean("is_external").default(false).notNull(), // true = External Client, false = Internal
  createdAt: timestamp("created_at").defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  companyId: integer("company_id").notNull().references(() => companies.id),
  status: text("status", { enum: ['pending', 'approved_manager', 'approved_finance', 'rejected'] }).default('pending').notNull(),
  billable: boolean("billable").default(false).notNull(),
  receiptUrl: text("receipt_url"),
  rejectionReason: text("rejection_reason"),
  approvedBy: varchar("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
    relationName: "expense_owner",
  }),
  approver: one(users, {
    fields: [expenses.approvedBy],
    references: [users.id],
    relationName: "expense_approver",
  }),
  company: one(companies, {
    fields: [expenses.companyId],
    references: [companies.id],
  }),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  expenses: many(expenses),
}));

export const usersRelations = relations(users, ({ many }) => ({
  expenses: many(expenses),
}));

// Schemas
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true });
export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, createdAt: true, status: true, rejectionReason: true, userId: true, approvedBy: true });
export const updateExpenseSchema = createInsertSchema(expenses).pick({
  description: true,
  amount: true,
  date: true,
  companyId: true,
  billable: true,
  receiptUrl: true,
}).partial();

// Types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type UpdateExpense = z.infer<typeof updateExpenseSchema>;

// API Types
export type CreateExpenseRequest = InsertExpense;
export type UpdateExpenseStatusRequest = { 
  status: 'approved_manager' | 'approved_finance' | 'rejected';
  rejectionReason?: string;
  billable?: boolean;
};
