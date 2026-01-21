import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExpenseSchema, type InsertExpense } from "@shared/schema";
import { useCreateExpense, useExpense, useUpdateExpense } from "@/hooks/use-expenses";
import { useCompanies } from "@/hooks/use-companies";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/PageHeader";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation, useSearch } from "wouter";
import { ObjectUploader } from "@/components/ObjectUploader";
import { UploadCloud } from "lucide-react";
import { useState, useEffect } from "react";
import { z } from "zod";

// Extend schema to handle string inputs from form
const formSchema = insertExpenseSchema.extend({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  companyId: z.coerce.number().min(1, "Please select a company"),
  date: z.coerce.date(),
});

export default function SubmitClaim() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const editId = params.get("edit");
  
  const { data: existingExpense, isLoading: isLoadingExpense } = useExpense(Number(editId));
  const { mutate: createMutation, isPending: isCreating } = useCreateExpense();
  const { mutate: updateMutation, isPending: isUpdating } = useUpdateExpense();
  const { data: companies } = useCompanies();
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: undefined,
      date: new Date(),
      companyId: undefined,
      billable: false,
    },
  });

  useEffect(() => {
    if (existingExpense) {
      form.reset({
        description: existingExpense.description,
        amount: Number(existingExpense.amount) as any,
        date: new Date(existingExpense.date),
        companyId: existingExpense.companyId,
        billable: existingExpense.billable,
      });
      setReceiptUrl(existingExpense.receiptUrl);
    }
  }, [existingExpense, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    
    // Format date to YYYY-MM-DD string as expected by backend `date` type
    const dateString = values.date.toISOString().split('T')[0];

    const payload = {
      ...values,
      date: dateString,
      userId: user.id,
      receiptUrl: receiptUrl,
    };

    if (editId) {
      updateMutation({ id: Number(editId), ...payload }, {
        onSuccess: () => setLocation("/my-expenses"),
      });
    } else {
      createMutation(payload as InsertExpense, {
        onSuccess: () => setLocation("/my-expenses"),
      });
    }
  }

  if (editId && isLoadingExpense) return <div className="p-8">Loading expense...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in">
      <PageHeader 
        title={editId ? "Edit Expense Claim" : "Submit Expense Claim"} 
        description={editId ? "Update your expense details and resubmit for approval." : "Fill out the details below to submit a new expense for approval."} 
      />

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company / Client</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value?.toString()}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies?.map((company) => (
                            <SelectItem key={company.id} value={company.id.toString()}>
                              {company.name} {company.isExternal ? '(External)' : '(Internal)'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Lunch with client, Office supplies, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Receipt</FormLabel>
                  <div className="mt-1">
                    <ObjectUploader
                      onGetUploadParameters={async (file: any) => {
                        const res = await fetch("/api/uploads/request-url", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            name: file.name,
                            size: file.size,
                            contentType: file.type,
                          }),
                        });
                        const { uploadURL } = await res.json();
                        return {
                          method: "PUT" as const,
                          url: uploadURL,
                          headers: { "Content-Type": file.type },
                        };
                      }}
                      onComplete={(result) => {
                        if (result.successful && result.successful.length > 0) {
                          setReceiptUrl(result.successful[0].uploadURL);
                        }
                      }}
                      buttonClassName="w-full"
                    >
                      {receiptUrl ? (
                        <span className="text-green-600 flex items-center justify-center gap-2">
                          Receipt Uploaded
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <UploadCloud className="w-4 h-4" /> Upload Receipt
                        </span>
                      )}
                    </ObjectUploader>
                  </div>
                </FormItem>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setLocation("/my-expenses")}>Cancel</Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {editId ? (isUpdating ? "Updating..." : "Update Claim") : (isCreating ? "Submitting..." : "Submit Claim")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
