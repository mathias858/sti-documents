import { AppLayout } from "@/components/layout/app-layout";
import { useGetDepartments, useCreateDepartment, useDeleteDepartment } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminDepartments() {
  const { data: departments, isLoading } = useGetDepartments();
  const createMutation = useCreateDepartment();
  const deleteMutation = useDeleteDepartment();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "", description: "" });

  const onSubmit = () => {
    if (!formData.name || !formData.code) return;

    createMutation.mutate({ data: formData }, {
      onSuccess: () => {
        setIsOpen(false);
        setFormData({ name: "", code: "", description: "" });
        queryClient.invalidateQueries({ queryKey: [`/api/departments`] });
        toast({ title: "Office Created" });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this office?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [`/api/departments`] });
          toast({ title: "Office Deleted" });
        }
      });
    }
  };

  return (
    <AppLayout title="">
      <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Office Management</h1>
            <p className="text-slate-500 mt-1">Registry of all official structural units and departments.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary"><Plus className="w-4 h-4 mr-2" /> Add Office</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Register Office</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Office Name</Label>
                  <Input value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} placeholder="e.g. Finance Department" />
                </div>
                <div className="space-y-2">
                  <Label>Official Code</Label>
                  <Input value={formData.code} onChange={e => setFormData(p => ({...p, code: e.target.value.toUpperCase()}))} className="uppercase font-mono" placeholder="FIN" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} placeholder="Functions and responsibilities..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={onSubmit} disabled={createMutation.isPending}>Save</Button>
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
                  <TableHead className="font-semibold text-slate-600 w-24">Code</TableHead>
                  <TableHead className="font-semibold text-slate-600">Office Name</TableHead>
                  <TableHead className="font-semibold text-slate-600">Description</TableHead>
                  <TableHead className="font-semibold text-slate-600">Established</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-right w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments?.map((d) => (
                  <TableRow key={d.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono font-bold text-primary">{d.code}</TableCell>
                    <TableCell className="text-slate-900 font-bold">{d.name}</TableCell>
                    <TableCell className="text-slate-500 text-sm max-w-[200px] truncate">{d.description || "-"}</TableCell>
                    <TableCell className="text-slate-500 whitespace-nowrap">{formatDate(d.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => handleDelete(d.id)}>
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
