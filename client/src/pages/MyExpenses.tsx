import { useExpenses } from "@/hooks/use-expenses";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { FileText, Plus, Pencil, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function MyExpenses() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: expenses, isLoading } = useExpenses({ userId: user?.id });

  if (isLoading) return <div className="p-8">Loading expenses...</div>;

  return (
    <div className="space-y-6 animate-in">
      <PageHeader title="My Expenses" description="Track and manage your submitted claims.">
        <Link href="/submit">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Claim
          </Button>
        </Link>
      </PageHeader>

      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Approved By</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses?.map((expense: any) => (
              <TableRow key={expense.id} className="hover:bg-slate-50/50">
                <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{expense.description}</span>
                    {expense.status === 'rejected' && expense.rejectionReason && (
                      <div className="flex items-center gap-1 text-[10px] text-red-500 mt-1">
                        <Info className="w-2.5 h-2.5" />
                        Rejected: {expense.rejectionReason}
                      </div>
                    )}
                    {expense.approvalComments && (
                      <div className="flex items-center gap-1 text-[10px] text-blue-500 mt-1">
                        <Info className="w-2.5 h-2.5" />
                        Note: {expense.approvalComments}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${expense.company.isExternal ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                    {expense.company.name}
                  </span>
                </TableCell>
                <TableCell className="font-mono">{formatCurrency(Number(expense.amount))}</TableCell>
                <TableCell><StatusBadge status={expense.status as any} /></TableCell>
                <TableCell className="text-sm text-slate-600">
                  {expense.approver ? `${expense.approver.firstName} ${expense.approver.lastName}` : '-'}
                </TableCell>
                <TableCell>
                  {expense.receiptUrl ? (
                    <a href={expense.receiptUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-sm">
                      <FileText className="w-3 h-3" /> View
                    </a>
                  ) : (
                    <span className="text-slate-400 text-sm">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {(expense.status === 'pending' || expense.status === 'rejected') && (
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-500 hover:text-blue-600"
                        onClick={() => setLocation(`/submit?edit=${expense.id}`)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {expenses?.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No expenses found. Submit your first claim!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
