import { AppLayout } from "@/components/layout/app-layout";
import { useGetRoles, useCreateRole } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, ShieldCheck, Check, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

export default function AdminRoles() {
  const { data: roles, isLoading } = useGetRoles();
  const createMutation = useCreateRole();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", level: 10, canSign: false, description: "" });

  const onSubmit = () => {
    if (!formData.name) return;

    createMutation.mutate({ data: formData }, {
      onSuccess: () => {
        setIsOpen(false);
        setFormData({ name: "", level: 10, canSign: false, description: "" });
        queryClient.invalidateQueries({ queryKey: [`/api/roles`] });
        toast({ title: "Role Created" });
      }
    });
  };

  return (
    <AppLayout title="">
      <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Role Management</h1>
            <p className="text-slate-500 mt-1">Define access levels and signatory permissions.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary"><Plus className="w-4 h-4 mr-2" /> Add Role</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create New Role</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2"><Label>Role Title</Label><Input value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} placeholder="e.g. Principal Secretary" /></div>
                
                <div className="space-y-2">
                  <Label>Hierarchy Level (1-100)</Label>
                  <Input type="number" min="1" max="100" value={formData.level} onChange={e => setFormData(p => ({...p, level: parseInt(e.target.value) || 10}))} />
                  <p className="text-xs text-slate-500">Higher numbers indicate greater authority in the system.</p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                  <div className="space-y-0.5">
                    <Label className="text-base">Signatory Rights</Label>
                    <p className="text-sm text-slate-500">Allow users with this role to digitally sign documents.</p>
                  </div>
                  <Switch checked={formData.canSign} onCheckedChange={c => setFormData(p => ({...p, canSign: c}))} />
                </div>

                <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} /></div>
              </div>
              <DialogFooter>
                <Button onClick={onSubmit} disabled={createMutation.isPending}>Save Role</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">Loading roles...</div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600">Role Name</TableHead>
                  <TableHead className="font-semibold text-slate-600 w-24">Level</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-center w-32">Can Sign</TableHead>
                  <TableHead className="font-semibold text-slate-600">Description</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-right w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles?.map((r) => (
                  <TableRow key={r.id} className="hover:bg-slate-50">
                    <TableCell className="font-bold text-slate-900">{r.name}</TableCell>
                    <TableCell className="font-mono text-slate-600">{r.level}</TableCell>
                    <TableCell className="text-center">
                      {r.canSign ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <Check className="w-3 h-3 mr-1" /> Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">
                          <X className="w-3 h-3 mr-1" /> No
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">{r.description || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary">Edit</Button>
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
