import { useExpenses, useUpdateExpenseStatus } from "@/hooks/use-expenses";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { Check, X, FileText, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export default function Approvals() {
  const { user } = useAuth();
  // @ts-ignore
  const role = user?.role || 'employee';
  const { mutate: updateStatus } = useUpdateExpenseStatus();

  // Filter based on role
  // Manager sees 'pending'
  // Finance sees 'approved_manager'
  const filterStatus = role === 'finance' ? 'approved_manager' : 'pending';
  const { data: expenses, isLoading } = useExpenses({ status: filterStatus });

  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = (id: number) => {
    // Manager -> approved_manager
    // Finance -> approved_finance
    const nextStatus = role === 'finance' ? 'approved_finance' : 'approved_manager';
    updateStatus({ id, status: nextStatus, billable: true }); // Defaulting billable to true for simplicity, finance can change logic later
  };

  const handleReject = () => {
    if (!rejectId) return;
    updateStatus({ id: rejectId, status: 'rejected', rejectionReason: rejectReason });
    setRejectId(null);
    setRejectReason("");
  };

  if (isLoading) return <div className="p-8">Loading approvals...</div>;

  return (
    <div className="space-y-6 animate-in">
      <PageHeader 
        title="Pending Approvals" 
        description={`Review claims waiting for ${role === 'finance' ? 'payment processing' : 'manager approval'}.`} 
      />

      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses?.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {expense.user.firstName?.[0]}{expense.user.lastName?.[0]}
                    </div>
                    {expense.user.firstName} {expense.user.lastName}
                  </div>
                </TableCell>
                <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${expense.company.isExternal ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                    {expense.company.name}
                  </span>
                </TableCell>
                <TableCell className="font-mono font-medium">{formatCurrency(Number(expense.amount))}</TableCell>
                <TableCell>
                  {expense.receiptUrl ? (
                    <a href={expense.receiptUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-sm">
                      <FileText className="w-3 h-3" /> View
                    </a>
                  ) : (
                    <span className="text-slate-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Missing
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setRejectId(expense.id)}>
                      <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(expense.id)}>
                      <Check className="w-4 h-4 mr-1" /> Approve
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {expenses?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  All caught up! No pending approvals.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Reject Dialog */}
      <Dialog open={!!rejectId} onOpenChange={(open) => !open && setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Expense Claim</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this claim. The employee will be notified.
            </DialogDescription>
          </DialogHeader>
          <Textarea 
            placeholder="Reason for rejection..." 
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject}>Confirm Rejection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
