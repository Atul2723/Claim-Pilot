import { db } from "./db";
import {
  users, companies, expenses,
  type User, type InsertUser,
  type Company, type InsertCompany,
  type Expense, type InsertExpense,
  type UpdateExpenseStatusRequest
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users (Auth handled by replitAuth storage, but we might need role updates)
  getUser(id: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  updateUserRole(id: string, role: string): Promise<User>;
  
  // Companies
  getCompanies(): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  deleteCompany(id: number): Promise<void>;
  
  // Expenses
  createExpense(expense: InsertExpense & { userId: string }): Promise<Expense>;
  getExpenses(userId?: string, role?: string): Promise<(Expense & { company: Company, user: User })[]>;
  getExpense(id: number): Promise<(Expense & { company: Company, user: User }) | undefined>;
  updateExpenseStatus(id: number, updates: UpdateExpenseStatusRequest): Promise<Expense>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const [user] = await db.update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies).orderBy(companies.name);
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async deleteCompany(id: number): Promise<void> {
    await db.delete(companies).where(eq(companies.id, id));
  }

  async createExpense(expense: InsertExpense & { userId: string }): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }

  async getExpenses(userId?: string, role?: string): Promise<(Expense & { company: Company, user: User })[]> {
    let query = db.select({
      id: expenses.id,
      description: expenses.description,
      amount: expenses.amount,
      date: expenses.date,
      userId: expenses.userId,
      companyId: expenses.companyId,
      status: expenses.status,
      billable: expenses.billable,
      receiptUrl: expenses.receiptUrl,
      rejectionReason: expenses.rejectionReason,
      createdAt: expenses.createdAt,
      company: companies,
      user: users
    })
    .from(expenses)
    .innerJoin(companies, eq(expenses.companyId, companies.id))
    .innerJoin(users, eq(expenses.userId, users.id))
    .orderBy(desc(expenses.date));

    // If employee, only see own expenses
    if (role === 'employee' && userId) {
      query.where(eq(expenses.userId, userId));
    }
    // Manager sees all? Or maybe just their team? Prompt implies generic Manager role approving. 
    // "Manager will have the authority to approve/reject expenses" - implies seeing all pending?
    // Let's assume Manager sees all for now, or maybe we filter by status pending/approved_manager for relevant roles.
    // Finance sees all.

    // If role is undefined (not passed), return all (internal use)
    
    // Convert result to match type structure
    const results = await query;
    return results.map(row => ({
      ...row,
      company: row.company,
      user: row.user
    }));
  }

  async getExpense(id: number): Promise<(Expense & { company: Company, user: User }) | undefined> {
    const [row] = await db.select({
      id: expenses.id,
      description: expenses.description,
      amount: expenses.amount,
      date: expenses.date,
      userId: expenses.userId,
      companyId: expenses.companyId,
      status: expenses.status,
      billable: expenses.billable,
      receiptUrl: expenses.receiptUrl,
      rejectionReason: expenses.rejectionReason,
      createdAt: expenses.createdAt,
      company: companies,
      user: users
    })
    .from(expenses)
    .innerJoin(companies, eq(expenses.companyId, companies.id))
    .innerJoin(users, eq(expenses.userId, users.id))
    .where(eq(expenses.id, id));

    if (!row) return undefined;

    return {
      ...row,
      company: row.company,
      user: row.user
    };
  }

  async updateExpenseStatus(id: number, updates: UpdateExpenseStatusRequest): Promise<Expense> {
    const [updated] = await db.update(expenses)
      .set(updates)
      .where(eq(expenses.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
