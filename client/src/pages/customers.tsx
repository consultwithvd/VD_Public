import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AddCustomerModal } from "@/components/modals/AddCustomerModal";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Building2 } from "lucide-react";

export default function Customers() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers, isLoading } = useQuery({
    queryKey: ["/api/customers"],
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    },
  });

  const handleDeleteCustomer = (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteCustomerMutation.mutate(id);
    }
  };

  const filteredCustomers = (customers as any)?.filter((customer: any) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-6">Loading customers...</div>;
  }

  return (
    <main className="p-6">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Customers</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage customer profiles and subscription assignments</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-vivid-purple hover:bg-vivid-purple/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search customers by name, email, or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers?.map((customer: any) => (
          <Card key={customer.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-vivid-purple rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {customer.name[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCustomer(customer.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customer.company && (
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{customer.company}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Phone:</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{customer.phone}</span>
                  </div>
                )}
                {customer.gstNumber && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">GST:</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{customer.gstNumber}</span>
                  </div>
                )}
                {customer.contactPerson && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Contact:</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{customer.contactPerson}</span>
                  </div>
                )}
                {customer.notes && (
                  <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-400">
                    {customer.notes}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!filteredCustomers?.length && (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No customers found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery ? "Try adjusting your search criteria" : "Get started by adding your first customer"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowAddModal(true)} className="bg-vivid-purple hover:bg-vivid-purple/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <AddCustomerModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </main>
  );
}
