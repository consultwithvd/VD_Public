import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AddResellerModal } from "@/components/modals/AddResellerModal";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Handshake, Percent } from "lucide-react";

export default function Resellers() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: resellers, isLoading } = useQuery({
    queryKey: ["/api/resellers"],
  });

  const deleteResellerMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/resellers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resellers"] });
      toast({
        title: "Success",
        description: "Reseller deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete reseller",
        variant: "destructive",
      });
    },
  });

  const handleDeleteReseller = (id: string) => {
    if (confirm("Are you sure you want to delete this reseller?")) {
      deleteResellerMutation.mutate(id);
    }
  };

  const filteredResellers = (resellers as any)?.filter((reseller: any) =>
    reseller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reseller.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reseller.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-6">Loading resellers...</div>;
  }

  return (
    <main className="p-6">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Resellers</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage reseller partnerships and commission tracking</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-vivid-purple hover:bg-vivid-purple/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Reseller
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search resellers by name, email, or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Resellers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResellers?.map((reseller: any) => (
          <Card key={reseller.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-vivid-orange rounded-lg flex items-center justify-center">
                    <Handshake className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{reseller.name}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{reseller.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={reseller.isActive ? "default" : "secondary"}>
                    {reseller.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteReseller(reseller.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reseller.company && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{reseller.company}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Percent className="h-4 w-4 text-vivid-orange" />
                    <span className="text-sm font-medium">Default Commission</span>
                  </div>
                  <span className="text-lg font-bold text-vivid-orange">
                    {Number(reseller.defaultCommissionRate || 0)}%
                  </span>
                </div>

                {reseller.phone && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Phone:</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{reseller.phone}</span>
                  </div>
                )}
                
                {reseller.panNumber && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">PAN:</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{reseller.panNumber}</span>
                  </div>
                )}

                {reseller.address && (
                  <div className="mt-3">
                    <span className="text-xs text-gray-500">Address:</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{reseller.address}</p>
                  </div>
                )}

                {reseller.bankDetails && (
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Bank Details Available</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!filteredResellers?.length && (
        <Card>
          <CardContent className="text-center py-12">
            <Handshake className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No resellers found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery ? "Try adjusting your search criteria" : "Get started by adding your first reseller partner"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowAddModal(true)} className="bg-vivid-purple hover:bg-vivid-purple/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Reseller
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <AddResellerModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </main>
  );
}
