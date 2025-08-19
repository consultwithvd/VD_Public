import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Layers } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-vivid-purple to-vivid-blue px-4">
      <Card className="max-w-md w-full bg-white dark:bg-gray-800 shadow-2xl">
        <CardContent className="p-8 space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-vivid-purple rounded-xl flex items-center justify-center mb-4">
              <Layers className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">ViViD Global Services - Internal Access</p>
          </div>
          
          <Button 
            onClick={handleLogin}
            className="w-full bg-vivid-purple hover:bg-vivid-purple/90 text-white py-3"
            size="lg"
          >
            Sign In to Continue
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need access? Contact your administrator
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
