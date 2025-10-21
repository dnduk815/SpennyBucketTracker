import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, User, Bell, Shield, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your profile has been updated successfully.",
    });
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
              <AvatarFallback className="text-2xl">JD</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">Profile</h2>
              <p className="text-sm text-muted-foreground">Manage your account information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-email"
              />
            </div>

            <Button onClick={handleSave} data-testid="button-save-profile">
              Save Changes
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5" />
            <div>
              <h3 className="text-lg font-semibold">Notifications</h3>
              <p className="text-sm text-muted-foreground">Configure your notification preferences</p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Low balance alerts</div>
                <div className="text-sm text-muted-foreground">Get notified when buckets are running low</div>
              </div>
              <Button variant="outline" size="sm" data-testid="button-toggle-low-balance">
                Enabled
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Weekly summaries</div>
                <div className="text-sm text-muted-foreground">Receive weekly spending reports</div>
              </div>
              <Button variant="outline" size="sm" data-testid="button-toggle-weekly">
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
              <p className="text-sm text-muted-foreground">Manage your security settings</p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Change password</div>
                <div className="text-sm text-muted-foreground">Update your account password</div>
              </div>
              <Button variant="outline" size="sm" data-testid="button-change-password">
                Change
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Two-factor authentication</div>
                <div className="text-sm text-muted-foreground">Add an extra layer of security</div>
              </div>
              <Button variant="outline" size="sm" data-testid="button-toggle-2fa">
                Enable
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-destructive">
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="w-5 h-5 text-destructive" />
            <div>
              <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
              <p className="text-sm text-muted-foreground">Irreversible actions</p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Delete all data</div>
                <div className="text-sm text-muted-foreground">Remove all buckets and transactions</div>
              </div>
              <Button variant="destructive" size="sm" data-testid="button-delete-data">
                Delete Data
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Delete account</div>
                <div className="text-sm text-muted-foreground">Permanently delete your account</div>
              </div>
              <Button variant="destructive" size="sm" data-testid="button-delete-account">
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
