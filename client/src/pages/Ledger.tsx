import { useExpenses } from "@/hooks/use-expenses";
import { PageHeader } from "@/components/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Ledger() {
  const { data: expenses, isLoading } = useExpenses();

  if (isLoading) return <div className="p-8">Loading ledger...</div>;

  return (
    <div className="space-y-6 animate-in">
      <PageHeader title="Expense Ledger" description="Master view of all company expenses.">
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </PageHeader>

      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Receipt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses?.map((expense) => (
              <TableRow key={expense.id} className="hover:bg-slate-50/50">
                <TableCell className="font-medium">
                  {expense.user.firstName} {expense.user.lastName}
                </TableCell>
                <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>{expense.company.name}</TableCell>
                <TableCell>
                  {expense.company.isExternal ? (
                    <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">Billable</span>
                  ) : (
                    <span className="text-xs text-slate-500">Internal</span>
                  )}
                </TableCell>
                <TableCell className="font-mono">{formatCurrency(Number(expense.amount))}</TableCell>
                <TableCell><StatusBadge status={expense.status as any} /></TableCell>
                <TableCell>
                  {expense.receiptUrl ? (
                    <a href={expense.receiptUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800">
                      <FileText className="w-4 h-4" />
                    </a>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
