import { useUsers, useUpdateUserRole } from "@/hooks/use-users";
import { PageHeader } from "@/components/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Users() {
  const { data: users, isLoading } = useUsers();
  const { mutate: updateRole } = useUpdateUserRole();

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRole({ id: userId, role: newRole as any });
  };

  if (isLoading) return <div className="p-8">Loading users...</div>;

  return (
    <div className="space-y-6 animate-in">
      <PageHeader title="User Management" description="Manage user roles and permissions." />

      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <img 
                      src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`} 
                      className="w-8 h-8 rounded-full bg-slate-100" 
                      alt="" 
                    />
                    <div>
                      <p>{user.firstName} {user.lastName}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select 
                    // @ts-ignore - Assuming role exists on user object or defaulting
                    defaultValue={user.role || 'employee'} 
                    onValueChange={(val) => handleRoleChange(user.id, val)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
