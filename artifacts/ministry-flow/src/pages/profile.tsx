import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Building, ShieldCheck, Key } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@workspace/api-client-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
        toast({ variant: "destructive", title: "Passwords match error", description: "New password and confirmation do not match" });
        return;
    }
    if (passwords.new.length < 6) {
        toast({ variant: "destructive", title: "Requirement error", description: "Password must be at least 6 characters" });
        return;
    }

    setLoading(true);
    try {
        await customFetch('/api/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({
                currentPassword: passwords.current,
                newPassword: passwords.new
            })
        });
        toast({ title: "Password Updated", description: "Your credentials have been updated successfully." });
        setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: any) {
        toast({ variant: "destructive", title: "Update Failed", description: err.message || "Could not update password" });
    } finally {
        setLoading(false);
    }
  };

  return (
    <AppLayout title="">
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Profile</h1>
          <p className="text-slate-500 mt-1">Manage your account settings and credentials</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 border-slate-200 shadow-sm h-fit">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                {user?.name?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
              <p className="text-sm text-slate-500 mb-4">{user?.email}</p>
              
              <div className="flex flex-col gap-2 w-full mt-4">
                <Badge variant="outline" className="w-full justify-center py-1.5 bg-slate-50">
                  <Building className="w-3 h-3 mr-2 text-slate-400" /> {user?.department?.name}
                </Badge>
                <Badge variant="outline" className="w-full justify-center py-1.5 bg-slate-50">
                  <ShieldCheck className="w-3 h-3 mr-2 text-slate-400" /> {user?.role?.name}
                </Badge>
                {user?.isAdmin && (
                  <Badge variant="secondary" className="w-full justify-center py-1.5 bg-primary/10 text-primary hover:bg-primary/20">
                    System Administrator
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg font-serif flex items-center">
                <Key className="w-5 h-5 mr-2 text-primary" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-4" onSubmit={handlePasswordChange}>
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" value={passwords.current} onChange={e => setPasswords(p => ({...p, current: e.target.value}))} required />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" value={passwords.new} onChange={e => setPasswords(p => ({...p, new: e.target.value}))} required />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({...p, confirm: e.target.value}))} required />
                </div>
                <div className="pt-4 flex justify-end">
                  <Button className="bg-primary" disabled={loading}>{loading ? "Updating..." : "Update Password"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
