import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSubscriptionSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

interface AddSubscriptionModalProps {
  open: boolean;
  onClose: () => void;
}

const formSchema = insertSubscriptionSchema.extend({
  softwareId: z.string().min(1, "Software is required"),
  customerId: z.string().min(1, "Customer is required"),
  purchasePrice: z.string().min(1, "Purchase price is required"),
  salesPrice: z.string().min(1, "Sales price is required"),
  commissionRate: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
});

type FormData = z.infer<typeof formSchema>;

export function AddSubscriptionModal({ open, onClose }: AddSubscriptionModalProps) {
  const [gstIncluded, setGstIncluded] = useState(false);
  const [tdsDeducted, setTdsDeducted] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
  });

  const { data: resellers } = useQuery({
    queryKey: ["/api/resellers"],
  });

  const { data: software } = useQuery({
    queryKey: ["/api/software"],
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      renewalFrequency: "Annual",
      status: "active",
    },
  });

  const purchasePrice = watch("purchasePrice");
  const salesPrice = watch("salesPrice");
  const commissionRate = watch("commissionRate");

  const createSubscriptionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/subscriptions", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Subscription created successfully",
      });
      onClose();
      reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create subscription",
        variant: "destructive",
      });
    },
  });

  // Calculate final amount
  useEffect(() => {
    if (salesPrice) {
      let amount = parseFloat(salesPrice);
      if (gstIncluded) {
        amount = amount * 1.18; // Add 18% GST
      }
      if (tdsDeducted) {
        amount = amount * 0.98; // Deduct 2% TDS
      }
      setValue("finalAmount", amount.toString());
    }
  }, [salesPrice, gstIncluded, tdsDeducted, setValue]);

  // Calculate commission amount
  useEffect(() => {
    if (salesPrice && commissionRate) {
      const commission = (parseFloat(salesPrice) * parseFloat(commissionRate)) / 100;
      setValue("commissionAmount", commission.toString());
    }
  }, [salesPrice, commissionRate, setValue]);

  const onSubmit = (data: FormData) => {
    const submissionData = {
      ...data,
      purchasePrice: parseFloat(data.purchasePrice),
      salesPrice: parseFloat(data.salesPrice),
      commissionRate: data.commissionRate ? parseFloat(data.commissionRate) : 0,
      commissionAmount: data.commissionAmount ? parseFloat(data.commissionAmount) : 0,
      finalAmount: parseFloat(data.finalAmount || data.salesPrice),
      gstIncluded,
      tdsDeducted,
      startDate: new Date(data.startDate),
      expiryDate: new Date(data.expiryDate),
    };

    createSubscriptionMutation.mutate(submissionData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Subscription</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Software Details */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Software Details</h4>
              
              <div>
                <Label htmlFor="softwareId">Software Name</Label>
                <Select onValueChange={(value) => setValue("softwareId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Software" />
                  </SelectTrigger>
                  <SelectContent>
                    {software?.map((item: any) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.brand} {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.softwareId && (
                  <p className="text-sm text-red-500">{errors.softwareId.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="planType">Plan/License Type</Label>
                <Input
                  id="planType"
                  {...register("planType")}
                  placeholder="e.g., Business Premium, Standard"
                />
              </div>
            </div>

            {/* Customer & Reseller */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Customer & Reseller</h4>
              
              <div>
                <Label htmlFor="customerId">Customer</Label>
                <Select onValueChange={(value) => setValue("customerId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((customer: any) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customerId && (
                  <p className="text-sm text-red-500">{errors.customerId.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="resellerId">Reseller (Optional)</Label>
                <Select onValueChange={(value) => setValue("resellerId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Reseller" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Direct Sale</SelectItem>
                    {resellers?.map((reseller: any) => (
                      <SelectItem key={reseller.id} value={reseller.id}>
                        {reseller.name} - {reseller.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pricing Details */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Pricing Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="purchasePrice">Purchase Price (₹)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  {...register("purchasePrice")}
                  placeholder="0"
                />
                {errors.purchasePrice && (
                  <p className="text-sm text-red-500">{errors.purchasePrice.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="salesPrice">Sales Price (₹)</Label>
                <Input
                  id="salesPrice"
                  type="number"
                  step="0.01"
                  {...register("salesPrice")}
                  placeholder="0"
                />
                {errors.salesPrice && (
                  <p className="text-sm text-red-500">{errors.salesPrice.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="commissionRate">Reseller Commission (%)</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  step="0.01"
                  {...register("commissionRate")}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gstIncluded"
                    checked={gstIncluded}
                    onCheckedChange={setGstIncluded}
                  />
                  <Label htmlFor="gstIncluded">Add GST (18%)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tdsDeducted"
                    checked={tdsDeducted}
                    onCheckedChange={setTdsDeducted}
                  />
                  <Label htmlFor="tdsDeducted">TDS Applicable</Label>
                </div>
              </div>
              <div>
                <Label htmlFor="finalAmount">Final Amount (₹)</Label>
                <Input
                  id="finalAmount"
                  {...register("finalAmount")}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Subscription Timeline */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Subscription Timeline</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  {...register("expiryDate")}
                />
                {errors.expiryDate && (
                  <p className="text-sm text-red-500">{errors.expiryDate.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="renewalFrequency">Renewal Frequency</Label>
                <Select onValueChange={(value) => setValue("renewalFrequency", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Half-yearly">Half-yearly</SelectItem>
                    <SelectItem value="Annual">Annual</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <textarea
              id="notes"
              {...register("notes")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-vivid-purple dark:bg-gray-700 dark:text-white"
              placeholder="Additional notes about this subscription..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-vivid-purple hover:bg-vivid-purple/90"
              disabled={createSubscriptionMutation.isPending}
            >
              {createSubscriptionMutation.isPending ? "Creating..." : "Save Subscription"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
