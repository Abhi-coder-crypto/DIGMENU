import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lock, User, TrendingUp, Calendar, Phone, LayoutDashboard, LogOut, ChefHat, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Customer } from "@shared/schema";
import restaurantBg from "@assets/stock_images/elegant_chinese_rest_3250bd82.jpg";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

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
      <div 
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          backgroundImage: `url(${restaurantBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-orange-900/60 backdrop-blur-sm"></div>
        
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-xl rounded-md shadow-2xl p-8 border border-white/20">
            <div className="flex flex-col items-center mb-8">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-5 rounded-full shadow-lg mb-4">
                <ChefHat className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-2">
                Ming's Chinese Cuisine
              </h1>
              <p className="text-gray-600 text-sm font-medium">Admin Dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-orange-500" />
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Admin Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 border-2 border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 rounded-md shadow-sm transition-all"
                    required
                    data-testid="input-admin-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-500 transition-colors"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border-2 border-red-300 rounded-md p-3">
                  <p className="text-red-700 text-sm font-medium text-center flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 dark:from-orange-500 dark:to-orange-600 dark:hover:from-orange-600 dark:hover:to-orange-700 text-white font-bold py-3 rounded-md shadow-lg hover:shadow-xl transition-all"
                disabled={isLoading}
                data-testid="button-admin-login"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="h-5 w-5" />
                    Access Dashboard
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-xs text-gray-500">
                Secure admin access only
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-background to-amber-50/30">
      <div className="border-b bg-gradient-to-r from-orange-500/95 to-amber-600/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-white">Customer Loyalty Dashboard</h1>
              <p className="text-sm text-white/90">Ming's Chinese Cuisine</p>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline"
              size="sm"
              className="bg-black border-gray-800 text-white no-default-hover-elevate"
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-white to-orange-50/50 border-orange-100/50">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700/80">
                Total Customers
              </CardTitle>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-md">
                <User className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-orange-950">{customers.length}</div>
              <p className="text-xs text-orange-700/60 mt-1">Registered members</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-amber-50/50 border-amber-100/50">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-700/80">
                Total Visits
              </CardTitle>
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-md">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-amber-950">
                {customers.reduce((sum, c) => sum + c.visits, 0)}
              </div>
              <p className="text-xs text-amber-700/60 mt-1">All-time visits</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-orange-50/50 border-orange-100/50">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700/80">
                Avg Visits/Customer
              </CardTitle>
              <div className="bg-gradient-to-br from-orange-600 to-amber-600 p-2 rounded-md">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-orange-950">
                {customers.length > 0 
                  ? (customers.reduce((sum, c) => sum + c.visits, 0) / customers.length).toFixed(1)
                  : '0'}
              </div>
              <p className="text-xs text-orange-700/60 mt-1">Customer loyalty</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-orange-100/30">
          <CardHeader className="bg-gradient-to-r from-orange-50/50 to-amber-50/30">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-md">
                <User className="h-4 w-4 text-white" />
              </div>
              <CardTitle className="text-lg text-orange-950">Customer List</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {customers.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-4 rounded-full">
                    <User className="h-8 w-8 text-orange-600" />
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
                    <tr className="border-b bg-orange-50/30">
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-orange-800/80 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-orange-800/80 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-orange-800/80 uppercase tracking-wider">
                        Visits
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-orange-800/80 uppercase tracking-wider">
                        First Visit
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-orange-800/80 uppercase tracking-wider">
                        Last Visit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100/30">
                    {customers.map((customer) => {
                      const getVisitBadge = (visits: number) => {
                        if (visits >= 10) return "bg-gradient-to-r from-orange-600 to-amber-600 text-white";
                        if (visits >= 5) return "bg-gradient-to-r from-orange-500 to-orange-600 text-white";
                        if (visits >= 3) return "bg-gradient-to-r from-amber-400 to-amber-500 text-white";
                        return "bg-orange-100 text-orange-800";
                      };

                      return (
                        <tr 
                          key={customer._id.toString()} 
                          className="hover-elevate"
                          data-testid={`row-customer-${customer._id.toString()}`}
                        >
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 p-1.5 rounded-md border border-orange-200/50">
                                <User className="h-3.5 w-3.5 text-orange-700" />
                              </div>
                              <span className="text-sm font-medium text-orange-950">{customer.name}</span>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-orange-600/60" />
                              <span className="text-sm text-muted-foreground">{customer.phoneNumber}</span>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-sm ${getVisitBadge(customer.visits)}`}>
                              <TrendingUp className="h-3.5 w-3.5" />
                              {customer.visits}
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-green-600/70" />
                              <span className="text-sm text-muted-foreground">
                                {new Date(customer.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-blue-600/70" />
                              <span className="text-sm text-muted-foreground">
                                {new Date(customer.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
