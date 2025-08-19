import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { AddSubscriptionModal } from "@/components/modals/AddSubscriptionModal";
import { apiRequest } from "@/lib/queryClient";
import { format, differenceInDays } from "date-fns";
import { Plus, Download, Filter, Eye, Edit, Trash2 } from "lucide-react";

export default function Subscriptions() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    status: "",
    software: "",
    customer: "",
    dateRange: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ["/api/subscriptions"],
  });

  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
  });

  const { data: software } = useQuery({
    queryKey: ["/api/software"],
  });

  const deleteSubscriptionMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/subscriptions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast({
        title: "Success",
        description: "Subscription deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete subscription",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-status-active/10 text-status-active";
      case "expiring":
        return "bg-status-expiring/10 text-status-expiring";
      case "overdue":
        return "bg-status-overdue/10 text-status-overdue";
      case "renewed":
        return "bg-status-renewed/10 text-status-renewed";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const days = differenceInDays(new Date(expiryDate), new Date());
    return days;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSubscriptions((subscriptions as any)?.map((s: any) => s.id) || []);
    } else {
      setSelectedSubscriptions([]);
    }
  };

  const handleSelectSubscription = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedSubscriptions([...selectedSubscriptions, id]);
    } else {
      setSelectedSubscriptions(selectedSubscriptions.filter(sId => sId !== id));
    }
  };

  const handleDeleteSubscription = (id: string) => {
    if (confirm("Are you sure you want to delete this subscription?")) {
      deleteSubscriptionMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading subscriptions...</div>;
  }

  return (
    <main className="p-6">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Subscriptions</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all customer subscriptions and renewals</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-vivid-purple hover:bg-vivid-purple/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Subscription
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="renewed">Recently Renewed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Software</label>
              <Select value={filters.software} onValueChange={(value) => setFilters({ ...filters, software: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Software" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Software</SelectItem>
                  {(software as any)?.map((item: any) => (
                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer</label>
              <Input
                type="text"
                placeholder="Search customer..."
                value={filters.customer}
                onChange={(e) => setFilters({ ...filters, customer: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</label>
              <Input
                type="date"
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Subscriptions ({(subscriptions as any)?.length || 0})</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <Checkbox
                      checked={selectedSubscriptions.length === (subscriptions as any)?.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Software
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Reseller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {(subscriptions as any)?.map((subscription: any) => {
                  const daysUntilExpiry = getDaysUntilExpiry(subscription.expiryDate);
                  const profit = Number(subscription.salesPrice) - Number(subscription.purchasePrice) - Number(subscription.commissionAmount || 0);
                  
                  return (
                    <tr key={subscription.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Checkbox
                          checked={selectedSubscriptions.includes(subscription.id)}
                          onCheckedChange={(checked) => handleSelectSubscription(subscription.id, checked as boolean)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-xs font-bold">
                              {subscription.software?.brand?.[0] || "S"}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {subscription.software?.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {subscription.planType}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {subscription.customer?.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {subscription.customer?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {subscription.reseller?.name || "Direct"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(subscription.status)}>
                          <span className="w-1.5 h-1.5 bg-current rounded-full mr-1"></span>
                          {subscription.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(Number(subscription.salesPrice))}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {subscription.renewalFrequency}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(profit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {format(new Date(subscription.expiryDate), "dd MMM yyyy")}
                        </div>
                        <div className="text-sm text-status-expiring">
                          {daysUntilExpiry > 0 ? `${daysUntilExpiry} days left` : "Expired"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSubscription(subscription.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!(subscriptions as any)?.length && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No subscriptions found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AddSubscriptionModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </main>
  );
}
