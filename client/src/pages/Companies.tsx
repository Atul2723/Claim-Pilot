import { useCompanies, useCreateCompany, useDeleteCompany } from "@/hooks/use-companies";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCompanySchema, type InsertCompany } from "@shared/schema";
import { Trash2, Building2, Plus } from "lucide-react";
import { useState } from "react";

export default function Companies() {
  const { data: companies, isLoading } = useCompanies();
  const { mutate: createCompany } = useCreateCompany();
  const { mutate: deleteCompany } = useDeleteCompany();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<InsertCompany>({
    resolver: zodResolver(insertCompanySchema),
    defaultValues: {
      name: "",
      isExternal: false,
    },
  });

  function onSubmit(values: InsertCompany) {
    createCompany(values, {
      onSuccess: () => {
        setIsOpen(false);
        form.reset();
      }
    });
  }

  if (isLoading) return <div className="p-8">Loading companies...</div>;

  return (
    <div className="space-y-6 animate-in">
      <PageHeader title="Company Management" description="Manage internal entities and external clients.">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Add Company
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isExternal"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>External Client?</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Mark as billable client
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end pt-4">
                  <Button type="submit">Add Company</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="border rounded-xl bg-white shadow-sm overflow-hidden max-w-4xl">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies?.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {company.name}
                </TableCell>
                <TableCell>
                  {company.isExternal ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      External Client
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      Internal Entity
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => deleteCompany(company.id)}>
                    <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
