import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lock, User, TrendingUp, Calendar, Phone, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Customer } from "@shared/schema";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { data: customers = [], refetch } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/check');
        const data = await response.json();
        setIsAuthenticated(data.isAdmin);
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setError("");
        refetch();
      } else {
        setError("Incorrect password");
      }
    } catch (error) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setPassword("");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-muted-foreground text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-3 pb-6">
            <div className="flex justify-center">
              <div className="bg-muted p-3 rounded-md">
                <Lock className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Enter your password to access the dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-admin-password"
                />
              </div>
              
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  <p className="text-destructive text-sm text-center">
                    {error}
                  </p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
                data-testid="button-admin-login"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-muted p-2 rounded-md">
                <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Customer management</p>
              </div>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline"
              size="sm"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Customers
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{customers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Visits
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {customers.reduce((sum, c) => sum + c.visits, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Visits/Customer
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {customers.length > 0 
                  ? (customers.reduce((sum, c) => sum + c.visits, 0) / customers.length).toFixed(1)
                  : '0'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {customers.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-muted p-4 rounded-full">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">No customers yet</p>
                    <p className="text-sm text-muted-foreground">Customer data will appear here once they register</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Visits
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        First Visit
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Last Visit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {customers.map((customer) => (
                      <tr 
                        key={customer._id.toString()} 
                        className="hover-elevate"
                        data-testid={`row-customer-${customer._id.toString()}`}
                      >
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="bg-muted p-1.5 rounded-md">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <span className="text-sm font-medium">{customer.name}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{customer.phoneNumber}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-md">
                            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm font-medium">{customer.visits}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-muted-foreground">
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-muted-foreground">
                            {new Date(customer.updatedAt).toLocaleDateString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
