import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./replit_integrations/auth";
import { registerAuthRoutes } from "./replit_integrations/auth";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Integrations
  await setupAuth(app);
  registerAuthRoutes(app);
  registerObjectStorageRoutes(app);

  // === API Routes ===

  // Companies
  app.get(api.companies.list.path, async (req, res) => {
    const companies = await storage.getCompanies();
    res.json(companies);
  });

  app.post(api.companies.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any; 
    // Ideally check if admin, but for now allow logged in users or strictly admin?
    // Let's enforce admin check in real app, but for MVP/seed maybe allow.
    // Let's fetch user role.
    const dbUser = await storage.getUser(user.claims.sub);
    if (dbUser?.role !== 'admin') return res.status(403).json({ message: "Admin only" });

    try {
      const input = api.companies.create.input.parse(req.body);
      const company = await storage.createCompany(input);
      res.status(201).json(company);
    } catch (e) {
       if (e instanceof z.ZodError) return res.status(400).json(e);
       throw e;
    }
  });

  app.delete(api.companies.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const dbUser = await storage.getUser(user.claims.sub);
    if (dbUser?.role !== 'admin') return res.status(403).json({ message: "Admin only" });

    await storage.deleteCompany(Number(req.params.id));
    res.sendStatus(204);
  });

  // Expenses
  app.get(api.expenses.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const dbUser = await storage.getUser(user.claims.sub);
    
    const expenses = await storage.getExpenses(dbUser?.id, dbUser?.role);
    res.json(expenses);
  });

  app.post(api.expenses.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    
    try {
      // Coerce numeric fields
      const input = api.expenses.create.input.extend({
        amount: z.coerce.string(), // Keep as string for numeric(10,2) but validate it's numeric
        companyId: z.coerce.number()
      }).parse(req.body);
      
      const expense = await storage.createExpense({
        ...input,
        userId: user.claims.sub
      });
      res.status(201).json(expense);
    } catch (e) {
      if (e instanceof z.ZodError) return res.status(400).json(e);
      throw e;
    }
  });

  app.patch("/api/expenses/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const dbUser = await storage.getUser(user.claims.sub);
    const expenseId = Number(req.params.id);

    const existing = await storage.getExpense(expenseId);
    if (!existing) return res.status(404).json({ message: "Not found" });

    // Only owner can edit, and only if pending or rejected
    if (existing.userId !== dbUser?.id) return res.status(403).json({ message: "Forbidden" });
    if (existing.status !== 'pending' && existing.status !== 'rejected') {
      return res.status(400).json({ message: "Cannot edit an approved expense" });
    }

    try {
      // Basic update logic
      const updated = await storage.updateExpense(expenseId, {
        ...req.body,
        status: 'pending', // Reset to pending on edit
        rejectionReason: null // Clear rejection reason
      });
      res.json(updated);
    } catch (e) {
      res.status(400).json({ message: "Update failed" });
    }
  });

  app.get(api.expenses.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const expense = await storage.getExpense(Number(req.params.id));
    if (!expense) return res.status(404).json({ message: "Not found" });
    
    // Check permissions? 
    // Employee can only see own. Manager/Finance can see others.
    const user = req.user as any;
    const dbUser = await storage.getUser(user.claims.sub);
    
    if (dbUser?.role === 'employee' && expense.userId !== dbUser.id) {
       return res.status(403).json({ message: "Forbidden" });
    }

    res.json(expense);
  });

  app.patch(api.expenses.updateStatus.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const dbUser = await storage.getUser(user.claims.sub);

    if (!['manager', 'finance', 'admin'].includes(dbUser?.role || '')) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Manager can approve to 'approved_manager' or reject
    // Finance can approve to 'approved_finance' or reject
    // Admin can do anything
    const input = api.expenses.updateStatus.input.parse(req.body);

    const updated = await storage.updateExpenseStatus(Number(req.params.id), {
      ...input,
      approvedBy: dbUser?.id
    });
    res.json(updated);
  });

  // Users (Role management)
  app.get(api.users.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const dbUser = await storage.getUser(user.claims.sub);
    if (dbUser?.role !== 'admin') return res.status(403).json({ message: "Admin only" });

    const users = await storage.getUsers();
    res.json(users);
  });

  app.patch(api.users.updateRole.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const dbUser = await storage.getUser(user.claims.sub);
    if (dbUser?.role !== 'admin') return res.status(403).json({ message: "Admin only" });

    const updated = await storage.updateUserRole(req.params.id, req.body.role);
    res.json(updated);
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const companies = await storage.getCompanies();
  if (companies.length === 0) {
    await storage.createCompany({ name: "Internal Operations", isExternal: false });
    await storage.createCompany({ name: "Acme Corp (Client)", isExternal: true });
    await storage.createCompany({ name: "Globex Inc (Client)", isExternal: true });
    console.log("Seeded companies");
  }
}
