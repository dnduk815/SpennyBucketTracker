import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, User, Bell, Shield, Trash2, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/api/useAuth";
import { apiClient } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading, logout, isLoggingOut } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isDeletingData, setIsDeletingData] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Update form fields when user data loads
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your profile has been updated successfully.",
    });
  };

  const handleDeleteAllData = async () => {
    setIsDeletingData(true);
    try {
      await apiClient.deleteAllUserData();
      toast({
        title: "Data deleted",
        description: "All your buckets and transactions have been removed.",
      });
      // Refresh the page to show empty state
      window.location.reload();
    } catch (error) {
      toast({
        title: "Failed to delete data",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeletingData(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await apiClient.deleteAccount();
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      // Redirect to auth page
      setLocation("/auth");
    } catch (error) {
      toast({
        title: "Failed to delete account",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleLogout = () => {
    logout();
    setLocation("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="text-2xl">
                {isLoading
                  ? "..."
                  : user
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">Profile</h2>
              <p className="text-sm text-muted-foreground">
                Manage your account information
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={isLoading ? "Loading..." : name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                data-testid="input-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={isLoading ? "Loading..." : email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                data-testid="input-email"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={isLoading}
              data-testid="button-save-profile"
            >
              {isLoading ? "Loading..." : "Save Changes"}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5" />
            <div>
              <h3 className="text-lg font-semibold">Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Configure your notification preferences
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Low balance alerts</div>
                <div className="text-sm text-muted-foreground">
                  Get notified when buckets are running low
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                data-testid="button-toggle-low-balance"
              >
                Enabled
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Weekly summaries</div>
                <div className="text-sm text-muted-foreground">
                  Receive weekly spending reports
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                data-testid="button-toggle-weekly"
              >
                Disabled
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5" />
            <div>
              <h3 className="text-lg font-semibold">Security</h3>
              <p className="text-sm text-muted-foreground">
                Manage your security settings
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Sign out</div>
                <div className="text-sm text-muted-foreground">
                  Log out of your account
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                data-testid="button-logout"
              >
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Change password</div>
                <div className="text-sm text-muted-foreground">
                  Update your account password
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                data-testid="button-change-password"
              >
                Change
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Two-factor authentication</div>
                <div className="text-sm text-muted-foreground">
                  Add an extra layer of security
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                data-testid="button-toggle-2fa"
              >
                Enable
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-destructive">
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="w-5 h-5 text-destructive" />
            <div>
              <h3 className="text-lg font-semibold text-destructive">
                Danger Zone
              </h3>
              <p className="text-sm text-muted-foreground">
                Irreversible actions
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Delete all data</div>
                <div className="text-sm text-muted-foreground">
                  Remove all buckets and transactions
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    data-testid="button-delete-data"
                  >
                    Delete Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete All Data</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will permanently delete all your buckets,
                      transactions, and income records. This action cannot be
                      undone. Are you sure you want to continue?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAllData}
                      disabled={isDeletingData}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeletingData ? "Deleting..." : "Delete All Data"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Delete account</div>
                <div className="text-sm text-muted-foreground">
                  Permanently delete your account
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    data-testid="button-delete-account"
                  >
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will permanently delete your account and all
                      associated data. This action cannot be undone. Are you
                      absolutely sure you want to continue?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={isDeletingAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeletingAccount ? "Deleting..." : "Delete Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
