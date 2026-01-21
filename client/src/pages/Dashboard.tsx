import { useExpenses } from "@/hooks/use-expenses";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { Receipt, Clock, CheckCircle2, AlertCircle, TrendingUp, Building2, Plus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();
  // @ts-ignore
  const role = user?.role || 'employee';
  
  // Fetch expenses relevant to the user
  const { data: expenses, isLoading } = useExpenses(
    role === 'employee' ? { userId: user?.id } : undefined
  );

  if (isLoading) return <div className="p-8">Loading dashboard...</div>;

  const stats = {
    pending: expenses?.filter(e => e.status === 'pending' || e.status === 'approved_manager').length || 0,
    approved: expenses?.filter(e => e.status === 'approved_finance' || e.status === 'processed').length || 0,
    total: expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0,
    billable: expenses?.filter(e => e.billable).reduce((sum, e) => sum + Number(e.amount), 0) || 0,
  };

  return (
    <div className="space-y-8 animate-in">
      <PageHeader 
        title={`Welcome back, ${user?.firstName}`} 
        description="Here's what's happening with your expense claims today."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-slate-400 mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.total)}</div>
            <p className="text-xs text-slate-400 mt-1">All time claims</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Billable Amount</CardTitle>
            <Building2 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.billable)}</div>
            <p className="text-xs text-slate-400 mt-1">Billable to clients</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Approved Claims</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-slate-400 mt-1">Successfully processed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-1">
            <CardTitle className="text-lg">Recent Claims</CardTitle>
            <Link href="/my-expenses">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenses?.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{expense.description}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        {new Date(expense.date).toLocaleDateString()} • {expense.company.name}
                        {expense.billable && (
                          <span className="px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600 font-medium scale-90">Billable</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{formatCurrency(Number(expense.amount))}</div>
                    <StatusBadge status={expense.status as any} />
                  </div>
                </div>
              ))}
              {(!expenses || expenses.length === 0) && (
                <div className="text-center py-8 text-slate-400">No recent claims found.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/submit" className="block">
              <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 h-12">
                <Plus className="w-5 h-5 mr-2" />
                New Expense Claim
              </Button>
            </Link>
            <Link href="/my-expenses" className="block">
              <Button variant="outline" className="w-full justify-start h-12">
                <Receipt className="w-5 h-5 mr-2" />
                My Expenses
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
