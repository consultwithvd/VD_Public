import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertResellerSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { useState } from "react";

interface AddResellerModalProps {
  open: boolean;
  onClose: () => void;
}

const formSchema = insertResellerSchema.extend({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  defaultCommissionRate: z.string().min(0, "Commission rate must be positive"),
});

type FormData = z.infer<typeof formSchema>;

export function AddResellerModal({ open, onClose }: AddResellerModalProps) {
  const [isActive, setIsActive] = useState(true);
  const [hasBankDetails, setHasBankDetails] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const createResellerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/resellers", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resellers"] });
      toast({
        title: "Success",
        description: "Reseller created successfully",
      });
      onClose();
      reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create reseller",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const submissionData = {
      ...data,
      defaultCommissionRate: parseFloat(data.defaultCommissionRate),
      isActive,
      bankDetails: hasBankDetails ? {} : null, // Placeholder for bank details
    };

    createResellerMutation.mutate(submissionData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Reseller</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h4>
              
              <div>
                <Label htmlFor="name">Reseller Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter reseller name"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="reseller@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  {...register("company")}
                  placeholder="Company name"
                />
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Business Information</h4>
              
              <div>
                <Label htmlFor="defaultCommissionRate">Default Commission Rate (%) *</Label>
                <Input
                  id="defaultCommissionRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...register("defaultCommissionRate")}
                  placeholder="0.00"
                />
                {errors.defaultCommissionRate && (
                  <p className="text-sm text-red-500">{errors.defaultCommissionRate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="panNumber">PAN Number</Label>
                <Input
                  id="panNumber"
                  {...register("panNumber")}
                  placeholder="ABCDE1234F"
                  className="uppercase"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked as boolean)}
                />
                <Label htmlFor="isActive" className="text-sm">
                  Active reseller
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasBankDetails"
                  checked={hasBankDetails}
                  onCheckedChange={(checked) => setHasBankDetails(checked as boolean)}
                />
                <Label htmlFor="hasBankDetails" className="text-sm">
                  Has bank details on file
                </Label>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register("address")}
              rows={3}
              placeholder="Complete business address..."
            />
          </div>

          {/* Bank Details Section (conditional) */}
          {hasBankDetails && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Bank Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    placeholder="Bank name"
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="Account number"
                  />
                </div>
                <div>
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    placeholder="IFSC code"
                    className="uppercase"
                  />
                </div>
                <div>
                  <Label htmlFor="accountHolderName">Account Holder Name</Label>
                  <Input
                    id="accountHolderName"
                    placeholder="Account holder name"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-vivid-purple hover:bg-vivid-purple/90"
              disabled={createResellerMutation.isPending}
            >
              {createResellerMutation.isPending ? "Creating..." : "Save Reseller"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
