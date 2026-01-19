import { useExpenses } from "@/hooks/use-expenses";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
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

  const totalSpent = expenses?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  const pendingCount = expenses?.filter(e => e.status === 'pending' || e.status === 'approved_manager').length || 0;
  const approvedCount = expenses?.filter(e => e.status === 'approved_finance').length || 0;
  
  // Manager specific stat: pending approvals
  const pendingApprovals = expenses?.filter(e => 
    role === 'manager' ? e.status === 'pending' : 
    role === 'finance' ? e.status === 'approved_manager' : false
  ).length || 0;

  return (
    <div className="space-y-8 animate-in">
      <PageHeader 
        title={`Welcome back, ${user?.firstName}`} 
        description="Here's what's happening with your expenses today."
      >
        <Link href="/submit">
          <Button>New Expense Claim</Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-100 font-medium text-sm flex items-center justify-between">
              Total Expenses
              <DollarSign className="w-4 h-4 opacity-70" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">{formatCurrency(totalSpent)}</div>
            <p className="text-blue-100 text-sm mt-1">All time volume</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-500 font-medium text-sm flex items-center justify-between">
              Pending Claims
              <Clock className="w-4 h-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{pendingCount}</div>
            <p className="text-slate-500 text-sm mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        {['manager', 'finance', 'admin'].includes(role) ? (
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-500 font-medium text-sm flex items-center justify-between">
                Action Required
                <CheckCircle className="w-4 h-4 text-orange-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{pendingApprovals}</div>
              <p className="text-slate-500 text-sm mt-1">Claims need your approval</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-500 font-medium text-sm flex items-center justify-between">
                Approved (Paid)
                <CheckCircle className="w-4 h-4 text-green-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{approvedCount}</div>
              <p className="text-slate-500 text-sm mt-1">Fully processed</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses && expenses.length > 0 ? (
            <div className="space-y-4">
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                  <div>
                    <p className="font-medium text-slate-900">{expense.description}</p>
                    <p className="text-sm text-slate-500">{new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatCurrency(Number(expense.amount))}</p>
                    <p className="text-xs text-slate-500 capitalize">{expense.status.replace('_', ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">No recent activity found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
