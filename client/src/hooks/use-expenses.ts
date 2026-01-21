import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertExpense, type UpdateExpenseStatusRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type ExpenseFilters = {
  status?: 'pending' | 'approved_manager' | 'approved_finance' | 'rejected';
  companyId?: number;
  userId?: string;
};

export function useExpenses(filters?: ExpenseFilters) {
  return useQuery({
    queryKey: [api.expenses.list.path, filters],
    queryFn: async () => {
      const url = new URL(api.expenses.list.path, window.location.origin);
      if (filters?.status) url.searchParams.append("status", filters.status);
      if (filters?.companyId) url.searchParams.append("companyId", String(filters.companyId));
      if (filters?.userId) url.searchParams.append("userId", filters.userId);

      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch expenses");
      return api.expenses.list.responses[200].parse(await res.json());
    },
  });
}

export function useExpense(id: number) {
  return useQuery({
    queryKey: [api.expenses.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.expenses.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch expense");
      return api.expenses.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertExpense) => {
      // Ensure types are correct for sending (zod.coerce in route handles string->number)
      const res = await fetch(api.expenses.create.path, {
        method: api.expenses.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create claim");
      }
      return api.expenses.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.expenses.list.path] });
      toast({ title: "Success", description: "Expense claim submitted" });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & any) => {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update claim");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.expenses.list.path] });
      toast({ title: "Success", description: "Expense claim updated" });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateExpenseStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateExpenseStatusRequest) => {
      const url = buildUrl(api.expenses.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.expenses.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }
      return api.expenses.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.expenses.list.path] });
      toast({ title: "Success", description: "Status updated" });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
