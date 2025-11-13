import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Save, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { WhatsAppSettings } from "@shared/schema";
import { useLocation } from "wouter";

export default function AdminSettings() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: settings, isLoading: settingsLoading } = useQuery<WhatsAppSettings>({
    queryKey: ["/api/whatsapp-settings"],
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/check');
        const data = await response.json();
        if (!data.isAdmin) {
          setLocation("/admin");
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setLocation("/admin");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [setLocation]);

  useEffect(() => {
    if (settings) {
      setApiKey(settings.apiKey || "");
      setPhoneNumberId(settings.phoneNumberId || "");
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/whatsapp-settings", { apiKey, phoneNumberId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp-settings"] });
      toast({
        title: "Success",
        description: "WhatsApp settings saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save WhatsApp settings",
        variant: "destructive",
      });
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  if (isLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-muted-foreground text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-background to-amber-50/30">
      <div className="border-b bg-gradient-to-r from-orange-500/95 to-amber-600/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-5">
          <div className="flex flex-wrap items-center gap-4">
            <Button
              onClick={() => setLocation("/admin")}
              variant="outline"
              size="sm"
              className="bg-white border-white/30 text-gray-800 no-default-hover-elevate no-default-active-elevate"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-white">Settings</h1>
              <p className="text-sm text-white/90">Configure WhatsApp integration</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <Card className="border-orange-100/30">
          <CardHeader className="bg-gradient-to-r from-orange-50/50 to-amber-50/30">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-md">
                <SettingsIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-orange-950">WhatsApp Integration</CardTitle>
                <CardDescription>Configure your WhatsApp Business API credentials for birthday marketing campaigns</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="apiKey">
                  WhatsApp API Key
                </label>
                <Input
                  id="apiKey"
                  type="text"
                  placeholder="Enter your WhatsApp Business API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-200"
                  data-testid="input-api-key"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your WhatsApp Business API key for authentication
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="phoneNumberId">
                  Phone Number ID
                </label>
                <Input
                  id="phoneNumberId"
                  type="text"
                  placeholder="Enter your WhatsApp Business phone number ID"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-200"
                  data-testid="input-phone-id"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The phone number ID from your WhatsApp Business account
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 dark:from-orange-500 dark:to-orange-600 dark:hover:from-orange-600 dark:hover:to-orange-700 text-white"
                  data-testid="button-save-settings"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveMutation.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t">
              <h3 className="text-sm font-semibold text-foreground mb-3">How to get your credentials:</h3>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Create a WhatsApp Business account at <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">business.facebook.com</a></li>
                <li>Set up the WhatsApp Business API</li>
                <li>Navigate to your WhatsApp Business settings</li>
                <li>Copy your API key and Phone Number ID</li>
                <li>Paste them in the fields above and save</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
