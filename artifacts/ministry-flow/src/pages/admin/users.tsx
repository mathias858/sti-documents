import { AppLayout } from "@/components/layout/app-layout";
import { useGetUsers, useCreateUser, useGetDepartments, useGetRoles, useDeleteUser } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Plus, Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function AdminUsers() {
  const { data: users, isLoading } = useGetUsers();
  const { data: departments } = useGetDepartments();
  const { data: roles } = useGetRoles();
  const createMutation = useCreateUser();
  const deleteMutation = useDeleteUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", departmentId: "", roleId: "", isAdmin: false
  });

  const onSubmit = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.departmentId || !formData.roleId) {
      toast({ variant: "destructive", title: "Validation Error", description: "All required fields must be filled" });
      return;
    }

    createMutation.mutate({
      data: {
        ...formData,
        departmentId: Number(formData.departmentId),
        roleId: Number(formData.roleId)
      }
    }, {
      onSuccess: () => {
        setIsOpen(false);
        setFormData({ name: "", email: "", password: "", departmentId: "", roleId: "", isAdmin: false });
        queryClient.invalidateQueries({ queryKey: [`/api/users`] });
        toast({ title: "User Created", description: "Official account provisioned." });
      }
    });
    return;
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [`/api/users`] });
          toast({ title: "User Deleted" });
        }
      });
    }
  };

  return (
    <AppLayout title="">
      <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
            <p className="text-slate-500 mt-1">Manage access and roles for all ministry personnel.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary"><Plus className="w-4 h-4 mr-2" /> Add User</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Provision New Official</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name <span className="text-red-500">*</span></Label>
                  <Input value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <Label>Email <span className="text-red-500">*</span></Label>
                  <Input type="email" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <Label>Temporary Password <span className="text-red-500">*</span></Label>
                  <Input type="password" value={formData.password} onChange={e => setFormData(p => ({...p, password: e.target.value}))} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department <span className="text-red-500">*</span></Label>
                    <Select value={formData.departmentId} onValueChange={v => setFormData(p => ({...p, departmentId: v}))}>
                      <SelectTrigger><SelectValue placeholder="Select Dept..." /></SelectTrigger>
                      <SelectContent>
                        {departments?.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name} ({d.code})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Role <span className="text-red-500">*</span></Label>
                    <Select value={formData.roleId} onValueChange={v => setFormData(p => ({...p, roleId: v}))}>
                      <SelectTrigger><SelectValue placeholder="Select Role..." /></SelectTrigger>
                      <SelectContent>
                        {roles?.map(r => <SelectItem key={r.id} value={r.id.toString()}>{r.name} {r.canSign ? '✍️' : ''}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 mt-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">System Administrator</Label>
                    <p className="text-sm text-slate-500">Grant full access to configuration.</p>
                  </div>
                  <Switch checked={formData.isAdmin} onCheckedChange={c => setFormData(p => ({...p, isAdmin: c}))} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={onSubmit} disabled={createMutation.isPending}>Provision Account</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">Loading directory...</div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600">Name</TableHead>
                  <TableHead className="font-semibold text-slate-600">Email</TableHead>
                  <TableHead className="font-semibold text-slate-600">Department</TableHead>
                  <TableHead className="font-semibold text-slate-600">Role</TableHead>
                  <TableHead className="font-semibold text-slate-600">Admin</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((u) => (
                  <TableRow key={u.id} className="hover:bg-slate-50">
                    <TableCell className="font-bold text-slate-900">{u.name}</TableCell>
                    <TableCell className="text-slate-600">{u.email}</TableCell>
                    <TableCell className="text-slate-600 font-medium">{u.department.name}</TableCell>
                    <TableCell className="text-slate-600">
                      {u.role.name}
                      {u.role.canSign && <ShieldCheck className="w-3 h-3 ml-1 inline text-emerald-600" />}
                    </TableCell>
                    <TableCell>
                      {u.isAdmin ? <Badge className="bg-primary/20 text-primary hover:bg-primary/20">YES</Badge> : <Badge variant="outline" className="text-slate-400">NO</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => handleDelete(u.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
