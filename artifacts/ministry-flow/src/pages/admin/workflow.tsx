import { AppLayout } from "@/components/layout/app-layout";
import { useGetWorkflowRules, useCreateWorkflowRule, useGetDepartments, useGetRoles, useDeleteWorkflowRule } from "@workspace/api-client-react";
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
import { Plus, ArrowRight, Trash2, GitBranch } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function AdminWorkflow() {
  const { data: rules, isLoading } = useGetWorkflowRules();
  const { data: departments } = useGetDepartments();
  const { data: roles } = useGetRoles();
  
  const createMutation = useCreateWorkflowRule();
  const deleteMutation = useDeleteWorkflowRule();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    fromDepartmentId: "", 
    toDepartmentId: "", 
    fromRoleId: "", 
    toRoleId: "",
    description: "" 
  });

  const onSubmit = () => {
    if (!formData.name || !formData.fromDepartmentId || !formData.toDepartmentId || !formData.fromRoleId || !formData.toRoleId) {
      toast({ variant: "destructive", title: "Error", description: "Please fill in all required fields" });
      return;
    }

    createMutation.mutate({ 
      data: {
        name: formData.name,
        fromDepartmentId: parseInt(formData.fromDepartmentId),
        toDepartmentId: parseInt(formData.toDepartmentId),
        fromRoleId: parseInt(formData.fromRoleId),
        toRoleId: parseInt(formData.toRoleId),
        description: formData.description
      } 
    }, {
      onSuccess: () => {
        setIsOpen(false);
        setFormData({ name: "", fromDepartmentId: "", toDepartmentId: "", fromRoleId: "", toRoleId: "", description: "" });
        queryClient.invalidateQueries({ queryKey: [`/api/workflow-rules`] });
        toast({ title: "Rule Created", description: "Workflow routing rule has been established." });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this workflow rule?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [`/api/workflow-rules`] });
          toast({ title: "Rule Deleted" });
        }
      });
    }
  };

  return (
    <AppLayout title="">
      <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Workflow Configuration</h1>
            <p className="text-slate-500 mt-1">Define document routing rules between offices and roles.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary"><Plus className="w-4 h-4 mr-2" /> Add Rule</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Configure Routing Rule</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Rule Name</Label>
                  <Input value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} placeholder="e.g. HR Approval to Finance" />
                </div>
                
                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="col-span-2 space-y-4 p-4 bg-slate-50 border rounded-lg">
                    <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider mb-2">From Source</h3>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select value={formData.fromDepartmentId} onValueChange={v => setFormData(p => ({...p, fromDepartmentId: v}))}>
                        <SelectTrigger><SelectValue placeholder="Select Dept" /></SelectTrigger>
                        <SelectContent>{departments?.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={formData.fromRoleId} onValueChange={v => setFormData(p => ({...p, fromRoleId: v}))}>
                        <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
                        <SelectContent>{roles?.map(r => <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="col-span-1 flex justify-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>

                  <div className="col-span-2 space-y-4 p-4 bg-slate-50 border rounded-lg">
                    <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider mb-2">To Destination</h3>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select value={formData.toDepartmentId} onValueChange={v => setFormData(p => ({...p, toDepartmentId: v}))}>
                        <SelectTrigger><SelectValue placeholder="Select Dept" /></SelectTrigger>
                        <SelectContent>{departments?.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={formData.toRoleId} onValueChange={v => setFormData(p => ({...p, toRoleId: v}))}>
                        <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
                        <SelectContent>{roles?.map(r => <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} placeholder="Explain when this rule applies..." />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={onSubmit} disabled={createMutation.isPending}>Create Rule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">Loading rules...</div>
          ) : rules && rules.length > 0 ? (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600">Rule Name</TableHead>
                  <TableHead className="font-semibold text-slate-600">Routing Path</TableHead>
                  <TableHead className="font-semibold text-slate-600">Description</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-right w-24">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules?.map((r) => (
                  <TableRow key={r.id} className="hover:bg-slate-50">
                    <TableCell className="font-bold text-slate-900">{r.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="text-slate-600">
                          <span className="font-semibold">{r.fromDepartment?.code || '???'}</span> ({r.fromRole?.name || 'Unknown Role'})
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <div className="text-primary">
                          <span className="font-semibold">{r.toDepartment?.code || '???'}</span> ({r.toRole?.name || 'Unknown Role'})
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm truncate max-w-[200px]">{r.description || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(r.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <GitBranch className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No Routing Rules</h3>
              <p className="text-slate-500 mt-1">Create rules to restrict how documents flow between departments.</p>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
