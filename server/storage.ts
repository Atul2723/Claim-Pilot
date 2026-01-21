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
  getExpenses(userId?: string, role?: string): Promise<any[]>;
  getExpense(id: number): Promise<any | undefined>;
  updateExpenseStatus(id: number, updates: UpdateExpenseStatusRequest & { approvedBy?: string }): Promise<Expense>;
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

  async getExpenses(userId?: string, role?: string): Promise<any[]> {
    const results = await db.query.expenses.findMany({
      with: { 
        user: true, 
        company: true,
        approver: true 
      },
      orderBy: (expenses, { desc }) => [desc(expenses.date)],
    });
    
    if (role === 'admin' || role === 'manager' || role === 'finance') {
      return results;
    }

    return results.filter(e => e.userId === userId);
  }

  async getExpense(id: number): Promise<any | undefined> {
    const expense = await db.query.expenses.findFirst({
      where: eq(expenses.id, id),
      with: { 
        user: true, 
        company: true,
        approver: true 
      }
    });
    return expense;
  }

  async updateExpenseStatus(id: number, updates: UpdateExpenseStatusRequest & { approvedBy?: string }): Promise<Expense> {
    const [updated] = await db.update(expenses)
      .set({
        status: updates.status,
        rejectionReason: updates.rejectionReason || null,
        approvalComments: updates.approvalComments || null,
        billable: updates.billable ?? false,
        approvedBy: updates.approvedBy || null
      })
      .where(eq(expenses.id, id))
      .returning();
    return updated;
  }

  async updateExpense(id: number, updates: any): Promise<Expense> {
    const [updated] = await db.update(expenses)
      .set(updates)
      .where(eq(expenses.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
