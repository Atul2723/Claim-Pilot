import { useExpenses } from "@/hooks/use-expenses";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function Reports() {
  const { data: expenses, isLoading } = useExpenses();

  if (isLoading) return <div className="p-8">Loading reports...</div>;

  const billableVsInternal = [
    { name: 'Billable', value: expenses?.filter(e => e.billable).reduce((sum, e) => sum + Number(e.amount), 0) || 0 },
    { name: 'Internal', value: expenses?.filter(e => !e.billable).reduce((sum, e) => sum + Number(e.amount), 0) || 0 },
  ];

  const statusDistribution = [
    { name: 'Pending', value: expenses?.filter(e => e.status === 'pending').length || 0 },
    { name: 'Approved', value: expenses?.filter(e => e.status === 'approved_finance' || e.status === 'processed').length || 0 },
    { name: 'Rejected', value: expenses?.filter(e => e.status === 'rejected').length || 0 },
  ];

  const COLORS = ['#2563EB', '#64748B', '#059669', '#DC2626'];

  return (
    <div className="space-y-8 animate-in">
      <PageHeader title="Financial Reports" description="Breakdown of company expenditures and billable claims." />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Billable vs Internal Expenses</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={billableVsInternal}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {billableVsInternal.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approval Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
