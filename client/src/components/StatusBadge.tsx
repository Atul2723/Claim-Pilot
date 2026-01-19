import { Badge } from "@/components/ui/badge";

type Status = 'pending' | 'approved_manager' | 'approved_finance' | 'rejected';

export function StatusBadge({ status }: { status: Status }) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
    approved_manager: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
    approved_finance: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
    rejected: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
  };

  const labels = {
    pending: "Pending",
    approved_manager: "Manager Approved",
    approved_finance: "Paid",
    rejected: "Rejected",
  };

  return (
    <Badge variant="outline" className={`whitespace-nowrap ${styles[status]}`}>
      {labels[status]}
    </Badge>
  );
}
