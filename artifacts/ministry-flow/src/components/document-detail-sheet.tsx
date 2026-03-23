import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { 
  useGetDocumentById, 
  useGetDocumentMinutes, 
  useGetDocumentMovements, 
  useGetDocumentAttachments, 
  useGetUsers, 
  useForwardDocument, 
  useSignDocument, 
  useAddMinuteEntry, 
  useUploadDocumentAttachment, 
  getGetDocumentByIdQueryKey,
  getGetDocumentMinutesQueryKey,
  getGetDocumentMovementsQueryKey,
  getGetDocumentAttachmentsQueryKey,
  getGetUsersQueryKey,
  DocumentStatus 
} from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { X, Send, ShieldCheck, Edit, MessageSquare, FileText, Download, Eye, UploadCloud, Clock, User, Activity, CheckCircle } from "lucide-react";

export function DocumentDetailSheet({ documentId, open, onOpenChange }: { documentId: number | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: doc, isLoading } = useGetDocumentById(documentId!, { query: { queryKey: getGetDocumentByIdQueryKey(documentId!), enabled: !!documentId } });
  const { data: minutes } = useGetDocumentMinutes(documentId!, { query: { queryKey: getGetDocumentMinutesQueryKey(documentId!), enabled: !!documentId } });
  const { data: movements } = useGetDocumentMovements(documentId!, { query: { queryKey: getGetDocumentMovementsQueryKey(documentId!), enabled: !!documentId } });
  const { data: attachments } = useGetDocumentAttachments(documentId!, { query: { queryKey: getGetDocumentAttachmentsQueryKey(documentId!), enabled: !!documentId } });
  const { data: users } = useGetUsers({ query: { queryKey: getGetUsersQueryKey(), enabled: !!documentId } });

  const forwardMutation = useForwardDocument();
  const signMutation = useSignDocument();
  const addMinuteMutation = useAddMinuteEntry();

  const [activeDialog, setActiveDialog] = useState<"forward" | "sign" | "minute" | null>(null);
  
  // Form states
  const [forwardTo, setForwardTo] = useState("");
  const [forwardAction, setForwardAction] = useState<"FORWARD" | "RETURN">("FORWARD");
  const [forwardMinute, setForwardMinute] = useState("");
  
  const [signRemarks, setSignRemarks] = useState("");
  const [minuteText, setMinuteText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleForward = () => {
    if (!forwardTo || !forwardMinute) {
      toast({ variant: "destructive", title: "Error", description: "Recipient and minute text are required" });
      return;
    }
    forwardMutation.mutate({
      id: documentId!,
      data: {
        toUserId: Number(forwardTo),
        action: forwardAction,
        minuteText: forwardMinute
      }
    }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Document forwarded successfully" });
        setActiveDialog(null);
        queryClient.invalidateQueries({ queryKey: [`/api/documents`] });
        onOpenChange(false);
      }
    });
  };

  const handleSign = () => {
    signMutation.mutate({
      id: documentId!,
      data: { remarks: signRemarks }
    }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Document signed successfully" });
        setActiveDialog(null);
        queryClient.invalidateQueries({ queryKey: [`/api/documents`] });
      }
    });
  };

  const handleAddMinute = () => {
    if (!minuteText) return;
    addMinuteMutation.mutate({
      id: documentId!,
      data: { text: minuteText }
    }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Minute added" });
        setActiveDialog(null);
        setMinuteText("");
        queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}/minutes`] });
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !documentId) return;
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/documents/${documentId}/attachments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ministry_flow_token')}`
        },
        body: formData
      });
      if (!response.ok) throw new Error("Upload failed");
      toast({ title: "Success", description: "File uploaded successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}/attachments`] });
    } catch (err) {
      toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload attachment" });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const [viewingFile, setViewingFile] = useState<{url: string, name: string} | null>(null);

  const downloadAttachment = async (attachmentId: number, filename: string) => {
    const token = localStorage.getItem('ministry_flow_token');
    try {
      const response = await fetch(`/api/attachments/${attachmentId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Download failed");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Download Error", description: err.message });
    }
  };

  const viewAttachment = async (attachmentId: number, filename: string) => {
    const token = localStorage.getItem('ministry_flow_token');
    try {
      const response = await fetch(`/api/attachments/${attachmentId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Could not load preview");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setViewingFile({ url, name: filename });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Preview Error", description: err.message });
    }
  };

  if (!open) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[800px] sm:max-w-full p-0 overflow-y-auto bg-slate-50 border-l border-slate-200">
          {isLoading || !doc ? (
            <div className="p-12 text-center text-slate-400">Loading document details...</div>
          ) : (
            <div className="flex flex-col h-full bg-slate-50">
              
              {/* Header */}
              <div className="bg-white border-b border-slate-200 p-6 sticky top-0 z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-mono text-slate-500 mb-1">{doc.referenceNumber}</p>
                    <SheetTitle className="text-2xl font-serif text-slate-900 leading-tight">{doc.subject}</SheetTitle>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={doc.status === DocumentStatus.RECEIVED ? "default" : doc.status === DocumentStatus.SIGNED ? "secondary" : "outline"} className="uppercase">
                      {doc.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant={doc.urgency === 'HIGH' ? "destructive" : doc.urgency === 'MEDIUM' ? "secondary" : "outline"}>
                      {doc.urgency} Priority
                    </Badge>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 mt-6 text-sm">
                  <div>
                    <p className="text-slate-500 mb-1 text-xs uppercase tracking-wider">Source</p>
                    <p className="font-medium text-slate-900 flex items-center"><User className="w-3 h-3 mr-1 text-slate-400"/> {doc.originator?.name || 'Unknown'} ({doc.originator?.department?.code || '-'})</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1 text-xs uppercase tracking-wider">Created</p>
                    <p className="font-medium text-slate-900 flex items-center"><Clock className="w-3 h-3 mr-1 text-slate-400"/> {formatDate(doc.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1 text-xs uppercase tracking-wider">Classification</p>
                    <p className="font-medium text-slate-900 flex items-center"><ShieldCheck className="w-3 h-3 mr-1 text-slate-400"/> {doc.classification}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1 text-xs uppercase tracking-wider">Signature</p>
                    <p className={`font-medium flex items-center ${doc.digitalSignatureStatus === 'SIGNED' ? 'text-green-600' : 'text-slate-600'}`}>
                      {doc.digitalSignatureStatus === 'SIGNED' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Edit className="w-3 h-3 mr-1" />}
                      {doc.digitalSignatureStatus}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 mt-8">
                  <Button className="bg-primary hover:bg-primary/90" onClick={() => setActiveDialog("forward")}>
                    <Send className="w-4 h-4 mr-2" /> Forward
                  </Button>
                  {user?.role?.canSign && doc.digitalSignatureStatus !== 'SIGNED' && (
                    <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50" onClick={() => setActiveDialog("sign")}>
                      <ShieldCheck className="w-4 h-4 mr-2" /> Sign Document
                    </Button>
                  )}
                  <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                    <Edit className="w-4 h-4 mr-2" /> Edit Details
                  </Button>
                  <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50" onClick={() => setActiveDialog("minute")}>
                    <MessageSquare className="w-4 h-4 mr-2" /> Add Minute
                  </Button>
                </div>
              </div>

              <div className="p-6">
                {/* Attachments */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">Attachments ({attachments?.length || 0})</h3>
                    <div>
                      <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                      <Button variant="ghost" size="sm" className="text-primary h-8" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="w-4 h-4 mr-2" /> Upload File
                      </Button>
                    </div>
                  </div>
                  
                  {attachments && attachments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {attachments.map(att => (
                        <div key={att.id} className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between hover:shadow-sm transition-shadow">
                          <div className="flex items-center overflow-hidden">
                            <FileText className="w-8 h-8 text-red-500 mr-3 shrink-0" />
                            <div className="truncate">
                              <p className="text-sm font-medium text-slate-800 truncate">{att.originalName}</p>
                              <p className="text-xs text-slate-500">{(att.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <div className="flex ml-2 shrink-0">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary" onClick={() => viewAttachment(att.id, att.originalName)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary" onClick={() => downloadAttachment(att.id, att.originalName)}>
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-lg bg-white">
                      <p className="text-sm text-slate-500">No attachments found.</p>
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <Tabs defaultValue="minutes" className="w-full">
                  <TabsList className="w-full bg-slate-200/50 p-1 mb-6">
                    <TabsTrigger value="minutes" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">Minute Sheet</TabsTrigger>
                    <TabsTrigger value="movement" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">Movement</TabsTrigger>
                    <TabsTrigger value="history" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">History</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="minutes" className="space-y-4">
                    {minutes && minutes.length > 0 ? minutes.map(min => (
                      <div key={min.id} className="relative pl-6 pb-6">
                        <div className="absolute left-0 top-1 w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-green-100"></div>
                        <div className="absolute left-[4px] top-4 bottom-0 w-px bg-slate-200"></div>
                        <div className="bg-white border border-slate-100 p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-sm text-slate-900">{min.user?.name || 'Unknown'}</p>
                              <p className="text-xs text-slate-500">{min.user?.role?.name || 'No Role'} • {min.user?.department?.name || 'No Dept'}</p>
                            </div>
                            <span className="text-xs text-slate-400">{formatDate(min.createdAt)}</span>
                          </div>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{min.text}</p>
                          {min.action && (
                            <Badge variant="outline" className="mt-3 bg-slate-50 text-[10px] uppercase">
                              {min.action}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )) : <p className="text-center text-sm text-slate-500 py-8">No minutes recorded.</p>}
                  </TabsContent>
                  
                  <TabsContent value="movement" className="space-y-4">
                    {movements && movements.length > 0 ? movements.map(mov => (
                      <div key={mov.id} className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                        <Activity className="w-5 h-5 text-blue-500 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-slate-800">
                            From <span className="font-semibold">{mov.fromUser?.name || 'Unknown'}</span> to <span className="font-semibold">{mov.toUser?.name || 'Unknown'}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{mov.toUser?.department?.name || ''}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="text-[10px] uppercase mb-1">{mov.action}</Badge>
                          <p className="text-xs text-slate-400 block">{formatDate(mov.createdAt)}</p>
                        </div>
                      </div>
                    )) : <p className="text-center text-sm text-slate-500 py-8">No movement history.</p>}
                  </TabsContent>
                  
                  <TabsContent value="history">
                    <p className="text-center text-sm text-slate-500 py-8">Audit log entries will appear here.</p>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialogs */}
      <Dialog open={activeDialog === "forward"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Forward Document</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 text-sm cursor-pointer">
                  <input type="radio" name="action" checked={forwardAction === "FORWARD"} onChange={() => setForwardAction("FORWARD")} className="text-primary focus:ring-primary h-4 w-4" />
                  <span>Forward to Next User</span>
                </label>
                <label className="flex items-center space-x-2 text-sm cursor-pointer">
                  <input type="radio" name="action" checked={forwardAction === "RETURN"} onChange={() => setForwardAction("RETURN")} className="text-orange-500 focus:ring-orange-500 h-4 w-4" />
                  <span>Return for Correction</span>
                </label>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Recipient</label>
              <Select value={forwardTo} onValueChange={setForwardTo}>
                <SelectTrigger><SelectValue placeholder="Search users or departments..." /></SelectTrigger>
                <SelectContent>
                  {users?.filter(u => u.id !== user?.id).map(u => (
                    <SelectItem key={u.id} value={u.id.toString()}>{u.name} - {u.department.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Minute / Remarks <span className="text-red-500">*</span></label>
              <Textarea 
                placeholder="Enter instructions or remarks..." 
                className="min-h-[100px]"
                value={forwardMinute}
                onChange={e => setForwardMinute(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
            <Button onClick={handleForward} disabled={forwardMutation.isPending}>
              {forwardMutation.isPending ? "Submitting..." : "Forward Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "sign"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Sign Document</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
              <p className="font-semibold mb-1">Legal Warning</p>
              <p>Applying your digital signature constitutes official approval of this document's contents. This action cannot be undone.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Remarks (Optional)</label>
              <Textarea 
                placeholder="Any final remarks before signing..." 
                value={signRemarks}
                onChange={e => setSignRemarks(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
            <Button onClick={handleSign} disabled={signMutation.isPending} className="bg-green-600 hover:bg-green-700">
              <ShieldCheck className="w-4 h-4 mr-2" /> Confirm Signature
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "minute"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Minute Entry</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Minute Text</label>
              <Textarea 
                placeholder="Write your minute here..." 
                className="min-h-[150px]"
                value={minuteText}
                onChange={e => setMinuteText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
            <Button onClick={handleAddMinute} disabled={addMinuteMutation.isPending}>
              Add Minute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingFile} onOpenChange={(open) => !open && setViewingFile(null)}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex justify-between items-center pr-8">
              <span>Preview: {viewingFile?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full h-full bg-slate-100">
            {viewingFile?.url ? (
              <iframe 
                src={viewingFile.url} 
                className="w-full h-full border-none"
                title="Document Preview"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                Loading preview...
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
