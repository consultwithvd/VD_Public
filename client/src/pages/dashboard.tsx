import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  AlertTriangle, 
  IndianRupee, 
  TrendingUp,
  BarChart3
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: upcomingRenewals, isLoading: renewalsLoading } = useQuery({
    queryKey: ["/api/subscriptions/expiring/30"],
  });

  const { data: recentSubscriptions, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ["/api/subscriptions"],
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

  if (metricsLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <main className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening with your subscriptions.</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-status-active/10">
                <CheckCircle className="h-6 w-6 text-status-active" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(metrics as any)?.activeSubscriptions || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-status-expiring/10">
                <AlertTriangle className="h-6 w-6 text-status-expiring" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(metrics as any)?.expiringSoon || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-vivid-purple/10">
                <IndianRupee className="h-6 w-6 text-vivid-purple" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency((metrics as any)?.monthlyRevenue || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-vivid-orange/10">
                <TrendingUp className="h-6 w-6 text-vivid-orange" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Profit</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency((metrics as any)?.monthlyProfit || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Upcoming Renewals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Upcoming Renewals */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Renewals</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">Subscriptions expiring in the next 30 days</p>
          </CardHeader>
          <CardContent>
            {renewalsLoading ? (
              <div>Loading renewals...</div>
            ) : (
              <div className="space-y-4">
                {(upcomingRenewals as any)?.slice(0, 3).map((renewal: any) => {
                  const daysLeft = getDaysUntilExpiry(renewal.expiryDate);
                  return (
                    <div key={renewal.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {renewal.software?.brand?.[0] || "S"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {renewal.software?.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {renewal.customer?.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-status-expiring">
                          {daysLeft} days
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatCurrency(Number(renewal.salesPrice))}/year
                        </p>
                      </div>
                    </div>
                  );
                })}
                {!(upcomingRenewals as any)?.length && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No upcoming renewals in the next 30 days
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">Monthly revenue and profit trends</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Revenue Chart</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Chart visualization coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Subscriptions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Subscriptions</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Latest subscription activities</p>
            </div>
            <button className="text-vivid-purple hover:text-vivid-blue font-medium text-sm">
              View All
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {subscriptionsLoading ? (
            <div>Loading subscriptions...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Software
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Expiry
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {(recentSubscriptions as any)?.slice(0, 5).map((subscription: any) => (
                    <tr key={subscription.id}>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {subscription.customer?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(subscription.status)}>
                          {subscription.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(Number(subscription.salesPrice))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(subscription.expiryDate), "dd MMM yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!(recentSubscriptions as any)?.length && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No subscriptions found
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
