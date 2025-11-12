import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lock, User, TrendingUp, Calendar, Phone, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Customer } from "@shared/schema";
import restaurantBg from "@assets/stock_images/elegant_chinese_rest_3250bd82.jpg";

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-gray-700 text-xl">Loading...</div>
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
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-orange-900/60 backdrop-blur-sm"></div>
        
        {/* Login form with frosted glass effect */}
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
            {/* Logo/Icon Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-5 rounded-full shadow-lg mb-4">
                <ChefHat className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-2">
                Ming's Chinese Cuisine
              </h1>
              <p className="text-gray-600 text-sm font-medium">Admin Dashboard</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-orange-500" />
                  Password
                </label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="Enter Admin Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-4 py-3 border-2 border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 rounded-xl shadow-sm transition-all"
                    required
                    data-testid="input-admin-password"
                  />
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3">
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
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
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

            {/* Footer */}
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl shadow-lg p-6 md:p-8 mb-6 relative overflow-hidden border border-slate-600">
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
          <div className="relative flex flex-wrap justify-between items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-orange-500/20 backdrop-blur-sm p-2 rounded-lg border border-orange-500/30">
                  <ChefHat className="h-8 w-8 text-orange-400" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Customer Loyalty Dashboard
                </h1>
              </div>
              <p className="text-slate-300 text-sm md:text-base">Track and manage your customer relationships</p>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white hover:bg-white/20 font-semibold transition-all"
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Customers</p>
                <p className="text-4xl md:text-5xl font-bold text-gray-900">{customers.length}</p>
              </div>
              <div className="bg-orange-500 p-4 rounded-xl">
                <User className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Visits</p>
                <p className="text-4xl md:text-5xl font-bold text-gray-900">
                  {customers.reduce((sum, c) => sum + c.visits, 0)}
                </p>
              </div>
              <div className="bg-blue-500 p-4 rounded-xl">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Avg Visits/Customer</p>
                <p className="text-4xl md:text-5xl font-bold text-gray-900">
                  {customers.length > 0 
                    ? (customers.reduce((sum, c) => sum + c.visits, 0) / customers.length).toFixed(1)
                    : '0'}
                </p>
              </div>
              <div className="bg-green-500 p-4 rounded-xl">
                <Calendar className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Customer List Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-slate-700 to-slate-600 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/20">
                <User className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Customer List</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Visits
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    First Visit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Last Visit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer, index) => {
                  const getVisitBadgeColor = (visits: number) => {
                    if (visits >= 10) return "bg-gradient-to-r from-purple-500 to-purple-600 text-white";
                    if (visits >= 5) return "bg-gradient-to-r from-green-500 to-green-600 text-white";
                    if (visits >= 3) return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
                    return "bg-gradient-to-r from-orange-500 to-orange-600 text-white";
                  };

                  return (
                    <tr 
                      key={customer._id.toString()} 
                      className="hover:bg-gray-50 transition-all duration-200 group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-500 p-2 rounded-lg">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">{customer.phoneNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-4 py-2 inline-flex items-center gap-2 text-sm font-bold rounded-full shadow-sm ${getVisitBadgeColor(customer.visits)}`}>
                          <TrendingUp className="h-4 w-4" />
                          {customer.visits} {customer.visits === 1 ? 'visit' : 'visits'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-gray-700">
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-700">
                            {new Date(customer.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {customers.length === 0 && (
              <div className="text-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-gray-100 p-6 rounded-full">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-gray-800 mb-1">No customers yet</p>
                    <p className="text-sm text-gray-500">Customer data will appear here once they register</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
