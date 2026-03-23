import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, Bell, Shield, Database, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({ title: "Settings Saved", description: "System configuration has been updated." });
  };

  return (
    <AppLayout title="">
      <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Settings</h1>
            <p className="text-slate-500 mt-1">Configure global parameters and security policies.</p>
          </div>
          <Button onClick={handleSave} className="bg-primary"><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
        </div>

        <div className="grid gap-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg flex items-center">
                <Globe className="w-5 h-5 mr-2 text-primary" />
                General Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ministry Name</Label>
                  <Input defaultValue="Ministry of Public Service" />
                </div>
                <div className="space-y-2">
                  <Label>System Identifier</Label>
                  <Input defaultValue="MPS-EDRMS-01" className="font-mono" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Official Support Email</Label>
                <Input defaultValue="support@publicservice.go.ke" type="email" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg flex items-center">
                <Shield className="w-5 h-5 mr-2 text-primary" />
                Security & Access
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                <div className="space-y-0.5">
                  <Label className="text-base">Two-Factor Authentication</Label>
                  <p className="text-sm text-slate-500">Enforce 2FA for all administrative accounts.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                <div className="space-y-0.5">
                  <Label className="text-base">Session Timeout</Label>
                  <p className="text-sm text-slate-500">Automatically logout users after 30 minutes of inactivity.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg flex items-center">
                <Bell className="w-5 h-5 mr-2 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Alerts</Label>
                  <p className="text-sm text-slate-500">Send email notifications for new documents and assignments.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
