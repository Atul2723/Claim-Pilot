import { Badge } from "@/components/ui/badge";

type Status = 'pending' | 'approved_manager' | 'approved_finance' | 'rejected' | 'processed';

export function StatusBadge({ status }: { status: Status }) {
  const styles = {
    pending: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
    approved_manager: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
    approved_finance: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
    rejected: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
    processed: "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100",
  };

  const labels = {
    pending: "Pending",
    approved_manager: "Manager Approved",
    approved_finance: "Finance Approved",
    rejected: "Rejected",
    processed: "Processed",
  };

  return (
    <Badge variant="outline" className={`whitespace-nowrap ${styles[status]}`}>
      {labels[status]}
    </Badge>
  );
}
